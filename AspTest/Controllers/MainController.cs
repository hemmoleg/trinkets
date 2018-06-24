using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using asptest.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RiotNet.Models;

namespace asptest.Controllers
{
    //IMAGES
    //https://discussion.developer.riotgames.com/questions/1556/is-there-a-way-to-get-champions-icon-image.html

    //C:\Users\yakuz\Documents\LoLReplay2
    [Route("Main")]
    public class MainController : Controller
    {
        private readonly DBReader dbReader;
        private readonly DBWriter dbWriter;
        private string userName = "hemmoleg";

        private readonly RiotApiRequester riotApiRequester;

        // dependency incejtion, inversion of control
        public MainController(DBReader dbReader, DBWriter dbWriter, RiotApiRequester riotApiRequester)
        {
            this.dbReader = dbReader;
            this.dbWriter = dbWriter;
            this.riotApiRequester = riotApiRequester;
            //this.riotApiRequester.Init(userName);

            this.dbReader.AccountID = riotApiRequester.AccountID;
            this.dbWriter.AccountID = riotApiRequester.AccountID;
        }

        public async Task Main()
        {
            await validateDatabase();
     
            //updateStaticChampionData();

            //removeNewChampionAsync();

            //var dbReader =(DBReader) this.HttpContext.RequestServices.GetService(typeof(DBReader));

            return;
            var riotApiMatches = await riotApiRequester.GetAllMatchesAsync();
            //riotApiRequester.CheckLatestMatchesAsync();

            var matchesFromDB = await dbReader.GetAllMatchesAsync();
            
            //addGradesToRecentGames();

            //var id = await dbReader.GetBiggestIdAsync();
            //Debug.WriteLine("Biggest id: " + id);
            //Debug.WriteLine("Games as Ekko: " + await dbReader.GetGameCountAsChampionAsync("Ekko"));

            //writeTestDBMatch(riotApiMatches);

            var grades = await getRecentGameGrades();
            var missingMatchReferences = await compareGamesApiAgainstDB(riotApiMatches, matchesFromDB);
            if( missingMatchReferences.Count > 0 )
            {
                Console.WriteLine("found missing games, but call to write is commented");
                //writeAllMissingGamesToDB(missingMatchReferences, grades);
            }
            else
            {
                Console.WriteLine("No new matches");
            }

            //compareGamesDBAgainstApi(riotApiMatches, matchesFromDB);
        }

        [HttpGet("GetMatchByID/{id}")]
        public async Task<IActionResult> GetMatchByID( [FromRoute] long id )
        {
            var result = await dbReader.GetMatchByIDAsync(id);
            return this.Ok(result);
        }

        [HttpGet( "GetWinrateByChampID/{id}" )]
        public async Task<IActionResult> GetWinrateByChampID( [FromRoute] int id )
        {
            var result = await dbReader.GetWinrateByChampID( id );
            return this.Ok( result );
        }

        [HttpGet( "GetMatchesByChampID/{id}" )]
        public async Task<IActionResult> GetMatchesByChampID( [FromRoute] int id )
        {
            var result = await dbReader.GetMatchesByChampID( id );
            return this.Ok( result );
        }

        [HttpGet( "GetAllPlayedChampions" )]
        public async Task<IActionResult> GetAllPlayedChampions()
        {
            var result = await dbReader.GetAllPlayedChampions(userName);
            return this.Ok( result );
        }

        private void writeAllMissingGamesToDB(List<MatchReference> matchReferences, Grades grades)
        {
            var counter = 0;
            foreach (var matchReference in matchReferences)
            {
                string grade = "?";
                foreach (var delta in grades.Deltas)
                {
                    if(delta.GameId != matchReference.GameId) continue;
                    grade = delta.ChampMastery.Grade;
                }

                dbWriter.WriteMatchToDB(matchReference,
                            riotApiRequester.GetMatchByIDAsync(matchReference.GameId).Result, grade);
                counter++;
                Console.WriteLine( "Written matches: " + counter + " of " + matchReferences.Count() );
            }
            Console.WriteLine("Wrote all missing games to db");
        }

        private async void removeNewChampionAsync()
        {
            var matchesFromDB = await dbReader.GetAllMatchesAsync();
            foreach (var match in matchesFromDB)
            {
                if( match.Title.Contains( "New champion" ) )
                {
                    dbWriter.RemoveMatch(match);
                }
            }
        }

        private async void updateStaticChampionData()
        {
            dbWriter.WriteStaticChampionData( riotApiRequester.GetStaticChampionDataAsync() );
        }

        private async Task validateDatabase()
        {
            if( ! await dbReader.IsTablePresent("staticChampion") )
            {
                dbWriter.CreateTable<DBStaticChampion>();
                dbWriter.WriteStaticChampionData( riotApiRequester.GetStaticChampionDataAsync() );
            }

            if( !await dbReader.IsTablePresent("staticItem") )
            {
                dbWriter.CreateTable<DBStaticItem>();
                dbWriter.WriteStaticItemData( riotApiRequester.GetStaticItemDataAsync() );
            }

            if( !await dbReader.IsTablePresent( "match" ) )
            {
                dbWriter.CreateTable<DBMatch>();
            }

            if( !await dbReader.IsTablePresent( "participant" ) )
            {
                dbWriter.CreateTable<DBParticipant>();
            }



            await dbReader.IsDatabaseValidAsync();
        }

        private void writeTestDBMatch(List<MatchList> riotApiMatches)
        {
            foreach (var matcheList in riotApiMatches)
            foreach (var match in matcheList.Matches)
                if (match.GameId == 3665228643 ) //  3614786597 //3664022406
                {
                   dbWriter.WriteMatchToDB(match, riotApiRequester.GetMatchByIDAsync(match.GameId).Result, null);
                }
        }

        private async void addGradesToRecentGames()
        {
            var grades = await getRecentGameGrades();
            foreach (var delta in grades.Deltas)
            {
                var match = await dbReader.GetMatchByIDAsync(delta.GameId);
                if( match == null )
                {
                    Console.WriteLine("Match not found, skipping update");
                    continue;
                }
                dbWriter.AddGradeToMatch(match, delta.ChampMastery.Grade);
                Console.WriteLine("Updated game " + match.Title + " with grade " + delta.ChampMastery.Grade);
            }
            
        }

        private static void compareGamesDBAgainstApi(List<MatchList> riotApiMatches, List<DBMatch> matchesFromDB)
        {
            var gamesNotFound = 0;
            foreach (var dbMatch in matchesFromDB)
            {
                Console.WriteLine($"Checking match id: {dbMatch.ID}");
                var matchFound = false;
                foreach (var matchList in riotApiMatches)
                {
                    foreach (var match in matchList.Matches)
                        if (dbMatch.GameId == match.GameId)
                        {
                            matchFound = true;
                            break;
                        }

                    if (matchFound) break;
                }

                if (matchFound) continue;
                Console.WriteLine($"Match {dbMatch.ID} not found in ApiMatches!");
                gamesNotFound++;
            }

            Console.WriteLine($"Games not found: {gamesNotFound}");
        }

        private static async Task<Grades> getRecentGameGrades()
        {
            //find lockfile
            var procList = Process.GetProcesses().Where(process => process.ProcessName.Contains("League"));
            string port = null;
            string key = null;
            foreach (var process in procList)
            {
                var completePath = Path.GetDirectoryName(process.MainModule.FileName);
                if (process.ProcessName != "LeagueClient") continue;

                Console.WriteLine("Path is: " + completePath.Substring(0, completePath.IndexOf("RADS", StringComparison.Ordinal)));
                var lockfilePath = completePath.Substring(0, completePath.IndexOf("RADS", StringComparison.Ordinal)) + "lockfile";

                if( !System.IO.File.Exists( lockfilePath ) )
                {
                    Console.WriteLine("Lockfile not found at " + lockfilePath);
                    return new Grades();
                }

                Console.WriteLine("lockfile exists");

                string text;
                using (var stream = System.IO.File.Open(lockfilePath, FileMode.Open, FileAccess.Read,
                    FileShare.ReadWrite))
                {
                    var reader = new StreamReader(stream);
                    text = await reader.ReadToEndAsync();
                }

                var texts = text.Split(":");

                port = texts[2];
                key = texts[3];
                Console.WriteLine("port: " + port + " key: " + key);

                break;
            }

            var httpClient =
                new HttpClient(new HttpClientHandler
                {
                    ServerCertificateCustomValidationCallback = (a, b, c, d) => true
                });
            var byteArray = Encoding.ASCII.GetBytes("riot:" + key);
            httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));

            HttpResponseMessage result;
            try
            {
                result = await httpClient.GetAsync("https://127.0.0.1:" + port + "/lol-match-history/v1/delta");
            }
            catch (Exception e)
            {
                Console.WriteLine("No response from httpClient, Lol client probably not running " + e);
                return new Grades();
            }
            var streamResult = await result.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Grades>(streamResult);
        }

        private async Task<List<MatchReference>> compareGamesApiAgainstDB(List<MatchList> riotApiMatches, List<DBMatch> dbMatchList)
        {
            var matchRefsNotFound = new List<MatchReference>();
            foreach (MatchList matchList in riotApiMatches)
            {
                Console.WriteLine($"Checking queueType {matchList.Matches[0].Queue}");
                foreach (var match in matchList.Matches)
                {
                    var matchFound = await dbReader.IsMatchFoundAsync(match.GameId);
                    if (matchFound) continue;
                    Console.WriteLine($"Match {match.GameId} not found in DB!");
                    matchRefsNotFound.Add(match);
                }
            }

            Console.WriteLine($"Games not found: {matchRefsNotFound.Count}");
            return matchRefsNotFound;
        }
    }
}