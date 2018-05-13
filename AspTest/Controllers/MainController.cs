using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using asptest.Models;
using Microsoft.AspNetCore.Mvc;

namespace asptest.Controllers
{
    public class MainController : Controller
    {
        private RiotApiRequester riotApiRequester;
        private DBReader dbReader;
        public MainController()
        {

        }

        public async Task Main()
        {
            riotApiRequester = new RiotApiRequester();
            //List<MatchList> riotApiMatches = await riotApiRequester.GetAllMatchesAsync();
            //riotApiRequester.CheckLatestMatchesAsync();

            dbReader = new DBReader();
            //List<DBMatch> matchesFromDB = await dbReader.GetAllMatchesAsync();
            //dbReader.WriteStaticChampionData(riotApiRequester.GetStaticChampionDataAsync());
            dbReader.WriteStaticChampionDataTest();

            /*foreach(MatchList matches in riotApiMatches)
            {
                await CompareGames(matches, matchesFromDB);
            }*/
        
        
        }

        /*private async Task CompareGames(MatchList apiMatchList, List<DBMatch> matchesFromDB)
        {
            int gamesNotFound = 0;
            Console.WriteLine($"Checking queueType {apiMatchList.Matches[0].Queue}");
            foreach(MatchReference match in apiMatchList.Matches)
            {
                bool matchFound = await dbReader.IsMatchFountAsync(match.GameId);
                if(!matchFound)
                {  

                    Console.WriteLine($"Match {match.GameId} not found in DB!");
                    gamesNotFound++;
                }
            }
            Console.WriteLine($"Games not found: {gamesNotFound}");
        }*/
    }
}