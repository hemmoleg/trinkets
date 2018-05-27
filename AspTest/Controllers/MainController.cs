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
            //var dbReader =(DBReader) this.HttpContext.RequestServices.GetService(typeof(DBReader));

            var riotApiMatches = await riotApiRequester.GetAllMatchesAsync();
            //riotApiRequester.CheckLatestMatchesAsync();

            var matchesFromDB = await dbReader.GetAllMatchesAsync();
            //dbReader.WriteStaticChampionData(riotApiRequester.GetStaticChampionDataAsync());
            //dbReader.WriteStaticChampionDataTest();


            var id = await dbReader.GetBiggestIdAsync();
            Debug.WriteLine("Biggest id: " + id);

            Debug.WriteLine("Games as Ekko: " + await dbReader.GetGamesAsChampionAsync("Ekko"));

            createTestDBMatch(riotApiMatches);

            /*long biggestGameID = 0;
            foreach (MatchList matches in riotApiMatches)
            {
                var currentBiggestGameId = await compareGamesApiAgainstDB(matches, matchesFromDB);
                if(biggestGameID < currentBiggestGameId) biggestGameID = currentBiggestGameId;
            }
            Console.WriteLine("Total largest missing gameId: " + biggestGameID);
            */
            //CompareGamesDBAgainstApi(riotApiMatches, matchesFromDB);
        }

        private void createTestDBMatch(List<MatchList> riotApiMatches)
        {
            foreach (var matcheList in riotApiMatches)
            foreach (var match in matcheList.Matches)
                if (match.GameId == 3634905799)
                {
                    var dbMatch =
                        dbWriter.WriteMatchToDB(match, riotApiRequester.GetMatchByIDAsync(match.GameId).Result);
                }
        }

        private void CompareGamesDBAgainstApi(List<MatchList> riotApiMatches, List<DBMatch> matchesFromDB)
        {
            var matchFound = false;
            var gamesNotFound = 0;
            foreach (var dbMatch in matchesFromDB)
            {
                Console.WriteLine($"Checking match id: {dbMatch.ID}");
                matchFound = false;
                foreach (var matcheList in riotApiMatches)
                {
                    foreach (var match in matcheList.Matches)
                        if (dbMatch.GameId == match.GameId)
                        {
                            matchFound = true;
                            break;
                        }

                    if (matchFound) break;
                }

                if (!matchFound)
                {
                    Console.WriteLine($"Match {dbMatch.ID} not found in DB!");
                    gamesNotFound++;
                }
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

        private async Task<long> compareGamesApiAgainstDB(MatchList apiMatchList, List<DBMatch> dbMatchList)
        {
            var gamesNotFound = 0;
            Console.WriteLine($"Checking queueType {apiMatchList.Matches[0].Queue}");
            foreach (var match in apiMatchList.Matches)
            {
                var matchFound = await dbReader.IsMatchFoundAsync(match.GameId);
                if (!matchFound)
                {
                    Console.WriteLine($"Match {match.GameId} not found in DB!");
                    if(match.GameId > biggestGameID) biggestGameID = match.GameId;
                    gamesNotFound++;
                }
            }

            Console.WriteLine($"Games not found: {gamesNotFound}");
            Console.WriteLine("Largest missing gameId: " + biggestGameID);
            return biggestGameID;
        }
    }
}