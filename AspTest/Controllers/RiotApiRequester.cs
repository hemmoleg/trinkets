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
        private IRiotClient RiotClient;
        private long SummonerID;
        private long AccountID;
        public RiotApiRequester()
        {
            RiotNet.RiotClient.DefaultPlatformId = PlatformId.EUW1;
            RiotNet.RiotClient.DefaultSettings = () => new RiotClientSettings
            {
                ApiKey = "RGAPI-ae7df57d-2c0e-493b-8d2d-1d707f5eca0d"
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

        public async void CheckLatestMatchesAsync()
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
                    return;
                }
                Console.WriteLine("Checking Match from " + matchReference.Timestamp);  
                if(await CheckLastMatchWinAsync(matchReference.GameId))
                {
                    Console.WriteLine("It was a wim!");
                }
                else
                {
                    Console.WriteLine("Someone fet their ass off");
                }
                i++;
            }
            

        }

        public async Task<bool> CheckLastMatchWinAsync(long matchID)
        {
            //ParticipabtIdentity == Account
            //Participant == actual champion and match related statistics

            //matchID = 3629403670;
            Match recentMatch = await RiotClient.GetMatchAsync(matchID);
            MatchTeam team = recentMatch.Teams[0];
            foreach(MatchParticipantIdentity identity in recentMatch.ParticipantIdentities)
            {
                if(identity.Player.AccountId == AccountID)
                {
                    return recentMatch.Participants[identity.ParticipantId].Stats.Win;
                }
            }

            throw new Exception("Current AccuntID (" + AccountID + ") not found in match! MatchId: " + matchID);
        }

        /*public async Task<List<MatchList>> GetAllMatchesAsync()
        {
            //this.HttpContext.RequestServices.GetService<IUserRepository>();

            //List<int> queueTypes = new List<int>(){42, 400, 410, 420, 440};
            //MatchList matches = await riotApi.GetMatchListAsync(Region.euw, AccountID, null, queueTypes);    

            //MatchList matches42 = await GetMatchesByQueueType(Region.euw, AccountID, 42);
            MatchList matches400 = await GetMatchesByQueueTypeAsync(Region.euw, AccountID, 400);
            MatchList matches410 = await GetMatchesByQueueTypeAsync(Region.euw, AccountID, 410);
            MatchList matches420 = await GetMatchesByQueueTypeAsync(Region.euw, AccountID, 420);
            MatchList matches440 = await GetMatchesByQueueTypeAsync(Region.euw, AccountID, 440);

            List<MatchList> matches = new List<MatchList>{matches400, matches410, matches420, matches440};
        
            return matches;
        }*/

        /*public async Task<MatchList> GetMatchesByQueueTypeAsync(Region region, long accountId, int queueType)
        {
            int beginIndex = 0;
            MatchList matches = new MatchList();
            matches.Matches = new List<MatchReference>();
            MatchList matchesTemp;

            do{
                matchesTemp = await riotApi.GetMatchListAsync(region, accountId, null, new []{ queueType }.ToList(), null, null, null, beginIndex);
                matches.Matches = matches.Matches.Concat(matchesTemp.Matches).ToList();
                beginIndex += 100;
            }while(matchesTemp.TotalGames > matches.Matches.Count());
        
            return matches;
        }*/

        public async Task<StaticChampionList> GetStaticChampionDataAsync()
        {
            return await RiotClient.GetStaticChampionsAsync(RiotNet.Models.Locale.en_US);
        }

    }
}