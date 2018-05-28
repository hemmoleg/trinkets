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

        private readonly RiotApiRequester riotApiRequester;

        // dependency incejtion, inversion of control
        public MainController(DBReader dbReader, DBWriter dbWriter, RiotApiRequester riotApiRequester)
        {
            this.dbReader = dbReader;
            this.dbWriter = dbWriter;
            this.riotApiRequester = riotApiRequester;

            this.dbReader.AccountID = riotApiRequester.AccountID;
            this.dbWriter.AccountID = riotApiRequester.AccountID;
        }

        public async Task Main()
        {
            //validateDatabase();

            //removeNewChampionAsync();

            //var dbReader =(DBReader) this.HttpContext.RequestServices.GetService(typeof(DBReader));

            var riotApiMatches = await riotApiRequester.GetAllMatchesAsync();
            //riotApiRequester.CheckLatestMatchesAsync();

            var matchesFromDB = await dbReader.GetAllMatchesAsync(); 

            //var id = await dbReader.GetBiggestIdAsync();
            //Debug.WriteLine("Biggest id: " + id);
            //Debug.WriteLine("Games as Ekko: " + await dbReader.GetGamesAsChampionAsync("Ekko"));

            //writeTestDBMatch(riotApiMatches);

            var matchReferences = await compareGamesApiAgainstDB(riotApiMatches, matchesFromDB);
            //writeAllMissingGamesToDB(matchReferences);

            //compareGamesDBAgainstApi(riotApiMatches, matchesFromDB);
        }

        [HttpGet("GetMatchByID/{id}")]
        public async Task<IActionResult> GetMatchByID( [FromRoute] long id )
        {
            var result = await dbReader.GetMatchByIDAsync(id);
            return this.Ok(result);
        }

        private void writeAllMissingGamesToDB(List<MatchReference> matchReferences)
        {
            var counter = 0;
            foreach (var matchReference in matchReferences)
            {
                dbWriter.WriteMatchToDB(matchReference,
                            riotApiRequester.GetMatchByIDAsync(matchReference.GameId).Result);
                counter++;
                Console.WriteLine( "Written matches: " + counter );
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

        private async void validateDatabase()
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
                //TODO write all matches
            }

            if( !await dbReader.IsTablePresent( "DBFilter" ) )
            {
                dbWriter.CreateTable<DBFilter>();
                //TODO figure this out
            }



            dbReader.IsDatabaseValidAsync();
        }

        private void writeTestDBMatch(List<MatchList> riotApiMatches)
        {
            foreach (var matcheList in riotApiMatches)
            foreach (var match in matcheList.Matches)
                if (match.GameId == 3614786597 )
                {
                   dbWriter.WriteMatchToDB(match, riotApiRequester.GetMatchByIDAsync(match.GameId).Result);
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

        public async Task GetRecentGameGrades()
        {
            //find lockfile
            var procList = Process.GetProcesses().Where(process => process.ProcessName.Contains("League"));
            var lockfilePath = "";
            string[] texts = null;
            string port = null;
            string key = null;
            foreach (var process in procList)
            {
                var completePath = Path.GetDirectoryName(process.MainModule.FileName);
                if (process.ProcessName == "LeagueClient")
                {
                    Console.WriteLine("Path is: " + completePath.Substring(0, completePath.IndexOf("RADS")));
                    lockfilePath = completePath.Substring(0, completePath.IndexOf("RADS")) + "lockfile";

                    if (!System.IO.File.Exists(lockfilePath))
                        return;

                    Console.WriteLine("lockfile exists");

                    string text = null;
                    using (var stream = System.IO.File.Open(lockfilePath, FileMode.Open, FileAccess.Read,
                        FileShare.ReadWrite))
                    {
                        var reader = new StreamReader(stream);
                        text = await reader.ReadToEndAsync();
                    }

                    texts = text.Split(":");

                    port = texts[2];
                    key = texts[3];
                    Console.WriteLine("port: " + port + " key: " + key);

                    break;
                }
            }

            var httpClient =
                new HttpClient(new HttpClientHandler
                {
                    ServerCertificateCustomValidationCallback = (a, b, c, d) => true
                });
            var byteArray = Encoding.ASCII.GetBytes("riot:" + key);
            httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));

            var result = await httpClient.GetAsync("https://127.0.0.1:" + port + "/lol-match-history/v1/delta");
            var streamResult = await result.Content.ReadAsStringAsync();
            var grades = JsonConvert.DeserializeObject<Grades>(streamResult);
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