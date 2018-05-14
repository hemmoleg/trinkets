using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RiotNet;
using RiotNet.Models;

namespace asptest.Controllers
{
    [Route("Function")]
    public class RiotApiRequester : Controller
    {
        /////////////TO BE REMOVED////////////////
        public DBReader DB {get; set;}

        private IRiotClient RiotClient;
        private long SummonerID;
        private long AccountID;
        public RiotApiRequester()
        {
            RiotNet.RiotClient.DefaultPlatformId = PlatformId.EUW1;
            RiotNet.RiotClient.DefaultSettings = () => new RiotClientSettings
            {
                ApiKey = "RGAPI-94b3953f-654a-425a-b2d6-cf5b91879270"
            };
            
            RiotClient = new RiotClient(); // Now you don't need to pass the settings or platform ID parameters.    
            SummonerID = 0; //20757027
            AccountID = 0;  //24045056
            //test game Id for short game 3629403670 (loss, lux, mid)
            try
            {
                SummonerID = RiotClient.GetSummonerBySummonerNameAsync("hemmoleg").Result.Id;
                AccountID = RiotClient.GetSummonerBySummonerNameAsync("hemmoleg").Result.AccountId;
            }
            catch (RestException ex)
            {
                Console.WriteLine("Could not get SummonerID! " + ex.Message);
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
        

            return null;
            //var result = await httpClient.GetAsync(url);
            //var streamResult = await result.Content.ReadAsStreamAsync();
            //return new FileStreamResult(streamResult, result.Content.Headers.ContentType.MediaType);t
        }

        public async Task<IActionResult> CheckLatestMatchesAsync()
        {
            MatchList recentMatches = null;
            try
            {
                recentMatches = await RiotClient.GetMatchListByAccountIdAsync(AccountID);    
            }
            catch (RestException ex)
            {
                Console.WriteLine(ex.Message);
            }
            
            int i = 0;
            foreach(MatchReference matchReference in recentMatches.Matches)
            {
                if(i > 20) 
                {
                    Console.WriteLine("done!");
                    return null;
                }
                
                Console.WriteLine("Checking Match from " + matchReference.Timestamp);  
                if(await CheckLastMatchWinAsync(matchReference.GameId))
                {
                    Console.WriteLine("It was a wim!");
                }
                else
                {
                    Console.WriteLine("Someone fed their ass off");
                }
                Console.WriteLine("");
                i++;
            }
            
            return null;
        }

        public async Task<bool> CheckLastMatchWinAsync(long matchID)
        {
            //ParticipabtIdentity == Account
            //Participant == actual champion and match related statistics

            //matchID = 3629403670;
            Match recentMatch = await RiotClient.GetMatchAsync(matchID);
            //MatchTeam team = recentMatch.Teams[0];
            foreach(MatchParticipantIdentity identity in recentMatch.ParticipantIdentities)
            {
                if(identity.Player.AccountId == AccountID)
                {
                    Console.WriteLine("You played " + await DB.GetChampionNameById(recentMatch.Participants[identity.ParticipantId-1].ChampionId));
                    return recentMatch.Participants[identity.ParticipantId-1].Stats.Win;
                }
            }

            throw new Exception("Current AccuntID (" + AccountID + ") not found in match! MatchId: " + matchID);
        }

        public async Task<List<MatchList>> GetAllMatchesAsync()
        {
            //this.HttpContext.RequestServices.GetService<IUserRepository>();

            //MatchList matches42 = await GetMatchesByQueueTypeAsync(42);
            MatchList matches400 = await GetMatchesByQueueTypeAsync(400);
            MatchList matches410 = await GetMatchesByQueueTypeAsync(410);
            MatchList matches420 = await GetMatchesByQueueTypeAsync(420);
            MatchList matches440 = await GetMatchesByQueueTypeAsync(440);

            List<MatchList> matches = new List<MatchList>{matches400, matches410, matches420, matches440};
        
            return matches;
        }

        public async Task<MatchList> GetMatchesByQueueTypeAsync(int queueType)
        {
            int beginIndex = 0;
            MatchList matches = new MatchList();
            matches.Matches = new List<MatchReference>();
            MatchList matchesTemp;

            do{
                matchesTemp = await RiotClient.GetMatchListByAccountIdAsync(AccountID, null, new QueueType[] { (QueueType)queueType }, null, null, null, beginIndex);
                matches.Matches = matches.Matches.Concat(matchesTemp.Matches).ToList();
                beginIndex += 100;
            }while(matchesTemp.TotalGames > matches.Matches.Count());
        
            return matches;
        }

        public async Task<StaticChampionList> GetStaticChampionDataAsync()
        {
            return await RiotClient.GetStaticChampionsAsync(RiotNet.Models.Locale.en_US, null, true);
        }

    }
}