using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using LoLStats.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using RiotNet.Models;

namespace LoLStats.Controllers
{
    //IMAGES
    //https://discussion.developer.riotgames.com/questions/1556/is-there-a-way-to-get-champions-icon-image.html
    //NEW STATIC DATA API
    //https://discussion.developer.riotgames.com/articles/5719/removal-of-the-lol-static-data-v3-api.html

    //C:\Users\yakuz\Documents\LoLReplay2
    [Route("Main")]
    public class MainController : Controller
    {
        private readonly DBReader dbReader;
        private readonly DBWriter dbWriter;

        private readonly RiotApiRequester riotApiRequester;
        private static List<MatchReference> missingMatchReferences;
        private static Grades missingMatchGrades;

        // dependency injection, inversion of control
        public MainController(DBReader dbReader, DBWriter dbWriter, RiotApiRequester riotApiRequester)//, ChatHub chatHub)
        {
            this.dbReader = dbReader;
            this.dbWriter = dbWriter;
            this.riotApiRequester = riotApiRequester;
            
            this.riotApiRequester.Init();


            this.dbReader.AccountID = riotApiRequester.AccountID;
            this.dbWriter.AccountID = riotApiRequester.AccountID;
        }

        [HttpGet( "Main" )]
        public async Task Main()
        {
            await validateDatabase();

            if( riotApiRequester.Enabled )
            {
                var missingGamesCount = await checkForNewGames();
                if( missingGamesCount > 0 )
                {
                    UpdateBtnUpdateDBText( missingGamesCount + " new Matches found" );
                    Console.WriteLine( "found missing games, but call to write is commented" );
                }
                else
                {
                    UpdateBtnUpdateDBText( "No new Matches" );
                    Console.WriteLine( "No new matches" );
                }
            } 
            else
                UpdateBtnUpdateDBText("No connection to Riot Servers");

            //updateStaticChampionData();

            //removeNewChampionAsync();

            //var dbReader =(DBReader) this.HttpContext.RequestServices.GetService(typeof(DBReader));

            //riotApiRequester.CheckLatestMatchesAsync();
            
            //addGradesToRecentGames();

            //var id = await dbReader.GetBiggestIdAsync();
            //Debug.WriteLine("Biggest id: " + id);
            //Debug.WriteLine("Games as Ekko: " + await dbReader.GetGameCountAsChampionAsync("Ekko"));

            //writeTestDBMatch(riotApiMatches);

            //compareGamesDBAgainstApi(riotApiMatches, matchesFromDB);
        }

        private async Task<int> checkForNewGames()
        {
            SendClientMessage("Requesting matches from Riot...");
            var riotApiMatches = await riotApiRequester.GetAllMatchesAsync();
            SendClientMessage( "Got matches from Riot..." );
            missingMatchGrades = await getRecentGameGrades();
            missingMatchReferences = await compareGamesApiAgainstDB( riotApiMatches );
            return missingMatchReferences.Count;
        }

        public void SendClientMessage(string message)
        {
            var hub = (IHubContext<ChatHub>) this.HttpContext.RequestServices.GetService<IHubContext<ChatHub>>();
            hub.Clients.All.SendAsync( "ReceiveMessage", "MainController", message );
        }

        public void UpdateBtnUpdateDBText( string message )
        {
            var hub = (IHubContext<ChatHub>) this.HttpContext.RequestServices.GetService<IHubContext<ChatHub>>();
            hub.Clients.All.SendAsync( "UpdateBtnUpdateDBText", "MainController", message );
        }

        public void AddMessageToConsole( string message )
        {
            var hub = (IHubContext<ChatHub>) this.HttpContext.RequestServices.GetService<IHubContext<ChatHub>>();
            hub.Clients.All.SendAsync( "AddMessageToConsole", "MainController", message );
        }

        [HttpGet("UpdateDB")]
        public StatusCodeResult UpdateDBAsync(  )
        {
            writeAllMissingGamesToDB(missingMatchReferences, missingMatchGrades);
            return this.StatusCode(200);
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
            var result = await dbReader.GetAllPlayedChampions(riotApiRequester.UserName);
            return this.Ok( result );
        }

        [HttpGet( "UpdateApiKey/{newApiKey}" )]
        public async Task UpdateApiKey( [FromRoute] string newApiKey )
        {
            riotApiRequester.UpdateApiKey(newApiKey);
            await Main();
        }

        [HttpGet( "GetChampionIconStringByIDAsync/{id}" )]
        public async Task<IActionResult> GetChampionIconStringByIDAsync([FromRoute] int id)
        {
            var result = await dbReader.GetChampionIconStringByIDAsync(id);
            return this.Ok(result);
        }

        private void writeAllMissingGamesToDB(List<MatchReference> matchReferences, Grades grades)
        {
            dbWriter.hub = (IHubContext<ChatHub>) this.HttpContext.RequestServices.GetService<IHubContext<ChatHub>>();

            //matchReferences[0].Timestamp

            matchReferences = matchReferences.OrderBy(x => x.Timestamp).ToList();

            var counter = 0;
            foreach (var matchReference in matchReferences)
            {
                var grade = "?";
                foreach (var delta in grades.Deltas.Where(delta => delta.GameId == matchReference.GameId))
                {
                    grade = delta.ChampMastery.Grade;
                }

                AddMessageToConsole( "Getting next match from Riot...");
                var match = riotApiRequester.GetMatchByIDAsync(matchReference.GameId).Result;

                //check for remake
                dbWriter.WriteMatchToDB(matchReference, match, grade, match.GameDuration < new TimeSpan(0, 14, 59));
                counter++;
                
                AddMessageToConsole( "Written matches: " + counter + " of " + matchReferences.Count() );
                Console.WriteLine( "Written matches: " + counter + " of " + matchReferences.Count() );
            }
            AddMessageToConsole( "Wrote all new games to db" );
            Console.WriteLine("Wrote all new games to db");
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

        [HttpGet( "UpdateStaticChampionData" )]
        public void UpdateStaticChampionData()
        {
            AddMessageToConsole( "updating static champion data..." );
            dbWriter.WriteStaticChampionData( riotApiRequester.GetStaticChampionDataAsync() );
            AddMessageToConsole( "updating static champion data done!" );
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

            if( !await dbReader.IsTablePresent( "remakes" ) )
            {
                dbWriter.CreateTable<DBRemake>();
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
                Console.WriteLine("No response from httpClient, Lol client probably not running ");
                return new Grades();
            }
            var streamResult = await result.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Grades>(streamResult);
        }

        private async Task<List<MatchReference>> compareGamesApiAgainstDB(List<MatchList> riotApiMatches)
        {
            var matchRefsNotFound = new List<MatchReference>();
            foreach (var matchList in riotApiMatches)
            {
                Console.WriteLine($"Checking queueType {matchList.Matches[0].Queue}");
                foreach (var matchReference in matchList.Matches)
                {
                    var matchFound = await dbReader.IsMatchFoundAsync(matchReference.GameId);
                    if (matchFound) continue;
                    Console.WriteLine($"Match {matchReference.GameId} not found in DB!");
                    matchRefsNotFound.Add(matchReference);
                }
            }

            Console.WriteLine($"Games not found: {matchRefsNotFound.Count}");
            return matchRefsNotFound;
        }
    }

    public class ChatHub : Hub
    {
        public async Task SendMessage( string user, string message )
        {
            await Clients.All.SendAsync( "ReceiveMessage", user, message );
        }
    }
}