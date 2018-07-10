using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RiotNet;
using RiotNet.Models;

namespace LoLStats.Controllers
{
    [Route("Function")]
    public class RiotApiRequester : Controller
    {
        private IRiotClient riotClient;
        /////////////TO BE REMOVED////////////////
        public DBReader DB { get; set; }
        public string UserName { get; private set; }
        private long SummonerID { get; set; }
        public long AccountID { get; set; }
        public bool Enabled { get; private set; }

        public RiotApiRequester()
        {
            var r = new StreamReader(
                new FileStream(Path.Combine(Directory.GetCurrentDirectory(), "config.txt"), FileMode.Open)
            );
            var json = r.ReadToEnd();
            dynamic config = JsonConvert.DeserializeObject(json);

            var settings = new RiotClientSettings {ApiKey = config.apiKey};


            RiotNet.RiotClient.DefaultPlatformId = config.platformID;//PlatformId.EUW1;
            RiotNet.RiotClient.DefaultSettings = () => settings;

            SummonerID = 0; //20757027
            AccountID = 0; //24045056
            UserName = config.accountName;
            riotClient = new RiotClient(); // Now you don't need to pass the settings or platform ID parameters.    
            //test game Id for short game 3629403670 (loss, lux, mid)

            r.Close();
        }

        public void Init()
        {

            try
            {
                SummonerID = riotClient.GetSummonerBySummonerNameAsync( this.UserName ).Result.Id;
                AccountID = riotClient.GetSummonerBySummonerNameAsync( this.UserName ).Result.AccountId;
                Enabled = true;
                Console.WriteLine("Got SummonerID");
            }
            catch( RestException ex )
            {
                Console.Error.WriteLine( "Could not get SummonerID! " + ex.Message );
            }
            catch( System.AggregateException ex )
            {
                Console.Error.WriteLine( "Could not get SummonerID! " + ex.Message );
            }
        }


        [HttpPost("GetSummonerInfo")]
        public async Task<IActionResult> GetSummonerInfoAsync([FromBody] SummonerInfoParams parameters)
        {
            /*try
            {
                //Async task create and manual start and await for end
                /*var getSummonerTask = new Task<RiotSharp.SummonerEndpoint.Summoner>( () =>
                {
                    return api.GetSummonerByName(Region.euw, "hemmoleg");
                } );
                getSummonerTask.Start();*/

            //Dynamic object
            /*dynamic summary = new 
            {
                champion = champion,
                summoner = summoner
            };*/

            /*List<ChampionMastery> championMasteries = new List<ChampionMastery>();
            try
            {
                championMasteries =  riotApi.GetChampionMasteries(RiotSharp.Misc.Region.euw, SummonerID);
            }
            catch (RiotSharpException ex)
            {
                // Handle the exception however you want.
            }

            return this.Ok();
        }*/


            return await Task.FromResult(NoContent());
        }

        public async Task<IActionResult> CheckLatestMatchesAsync()
        {
            MatchList recentMatches = null;
            try
            {
                recentMatches = await riotClient.GetMatchListByAccountIdAsync(AccountID);
            }
            catch (RestException ex)
            {
                Console.WriteLine(ex.Message);
            }

            var i = 0;
            if (recentMatches != null)
                foreach (var matchReference in recentMatches.Matches)
                {
                    if (i > 20)
                    {
                        Console.WriteLine("done!");
                        return null;
                    }

                    Console.WriteLine("Checking Match from " + matchReference.Timestamp);
                    if (await CheckLastMatchWinAsync(matchReference.GameId))
                        Console.WriteLine("It was a wim!");
                    else
                        Console.WriteLine("Someone fed their ass off");

                    Console.WriteLine("");
                    i++;
                }

            return null;
        }

        public async Task<Match> GetMatchByIDAsync(long matchID)
        {
            return await riotClient.GetMatchAsync(matchID);
        }

        public async Task<bool> CheckLastMatchWinAsync(long matchId)
        {
            //ParticipabtIdentity == Account
            //Participant == actual champion and match related statistics

            //matchID = 3629403670;
            var recentMatch = await riotClient.GetMatchAsync(matchId);
            //MatchTeam team = recentMatch.Teams[0];
            foreach (var identity in recentMatch.ParticipantIdentities)
                if (identity.Player.AccountId == AccountID)
                {
                    Console.WriteLine("You played " +
                                      await DB.GetChampionNameByIdAsync(recentMatch
                                          .Participants[identity.ParticipantId - 1].ChampionId));
                    return recentMatch.Participants[identity.ParticipantId - 1].Stats.Win;
                }

            throw new Exception("Current AccuntID (" + AccountID + ") not found in match! MatchId: " + matchId);
        }

        public async Task<List<MatchList>> GetAllMatchesAsync()
        {
            //this.HttpContext.RequestServices.GetService<IUserRepository>();

            var matches61 = await GetMatchesByQueueTypeAsync(61);
            var matches400 = await GetMatchesByQueueTypeAsync(400);
            var matches410 = await GetMatchesByQueueTypeAsync(410);
            var matches420 = await GetMatchesByQueueTypeAsync(420);
            var matches440 = await GetMatchesByQueueTypeAsync(440);

            var matches = new List<MatchList> {matches61, matches400, matches410, matches420, matches440};

            return matches;
        }

        public async Task<MatchList> GetMatchesByQueueTypeAsync(int queueType)
        {
            var beginIndex = 0;
            var matches = new MatchList();
            matches.Matches = new List<MatchReference>();
            MatchList matchesTemp;

            do
            {
                matchesTemp = await riotClient.GetMatchListByAccountIdAsync(AccountID, null,
                    new[] {(QueueType) queueType}, null, null, null, beginIndex);
                matches.Matches = matches.Matches.Concat(matchesTemp.Matches).ToList();
                beginIndex += 100;
            } while (matchesTemp.TotalGames > matches.Matches.Count());

            return matches;
        }

        public void UpdateApiKey( string newApiKey )
        {
            var settings = new RiotClientSettings { ApiKey = newApiKey };
            RiotNet.RiotClient.DefaultSettings = () => settings;
            riotClient = new RiotClient();
            Init();
            if( Enabled )
            {
                string allText = System.IO.File.ReadAllText( Path.Combine( Directory.GetCurrentDirectory(), "config.txt" ) );
                dynamic config = Newtonsoft.Json.JsonConvert.DeserializeObject( allText );
                config.apiKey = newApiKey;
                var output = Newtonsoft.Json.JsonConvert.SerializeObject( config, Newtonsoft.Json.Formatting.Indented );
                System.IO.File.WriteAllText( Path.Combine( Directory.GetCurrentDirectory(), "config.txt" ), output );
            }
        }

        public async Task<StaticChampionList> GetStaticChampionDataAsync()
        {
            return await riotClient.GetStaticChampionsAsync(Locale.en_US, null, true);
        }

        public async Task<StaticItemList> GetStaticItemDataAsync()
        {
            return await riotClient.GetStaticItemsAsync(null, null, new[] {"gold", "from", "image"});
        }
    }
}