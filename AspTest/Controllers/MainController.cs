using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using asptest.Models;
using Microsoft.AspNetCore.Mvc;
using RiotNet.Models;

namespace asptest.Controllers
{
    public class MainController : Controller
    {
        private readonly RiotApiRequester riotApiRequester;
        private readonly DBReader dbReader;
        // dependency incejtion, inversion of control
        public MainController(DBReader dbReader, RiotApiRequester riotApiRequester)
        {
            this.dbReader = dbReader;
            this.riotApiRequester = riotApiRequester;
        }

        public async Task Main()
        {
            //var dbReader =(DBReader) this.HttpContext.RequestServices.GetService(typeof(DBReader));
            
            List<MatchList> riotApiMatches = await this.riotApiRequester.GetAllMatchesAsync();
            //riotApiRequester.CheckLatestMatchesAsync();
            
            List<DBMatch> matchesFromDB = await this.dbReader.GetAllMatchesAsync();
            //dbReader.WriteStaticChampionData(riotApiRequester.GetStaticChampionDataAsync());
            //dbReader.WriteStaticChampionDataTest();
            
            foreach(MatchList matches in riotApiMatches)
            {
                await CompareGames(matches, matchesFromDB);
            }
        }

        private async Task CompareGames(MatchList apiMatchList, List<DBMatch> matchesFromDB)
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
        }
    }
}