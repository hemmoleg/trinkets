using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using asptest.Models;
using Microsoft.AspNetCore.Mvc;
using RiotNet.Models;
using SQLite;

namespace asptest.Controllers
{
    public class DBReader : DBAccessor
    {   
        public async Task<List<DBMatch>> GetAllMatchesAsync()
        {
            //var query = db.Table<DBItem>().Where(v => v.name.StartsWith("A"));
            //var result = await query.ToListAsync();
            
            //var queryMatch = db.Table<DBMatch>();
            //var resultMatch = await queryMatch.ToListAsync();

            //TEAM_BUILDER_DRAFT_UNRANKED_5x5 == 400 == 5v5 Draft Pick games
            //TEAM_BUILDER_DRAFT_RANKED_5x5  == 410 == 5v5 Ranked Dynamic games
            //RANKED_TEAM_5x5 == 42 == 5v5 Ranked Team games
            //RANKED_SOLO_5x5 == 420 == 5v5 Ranked Solo games
            //RANKED_FLEX_SR == 440 == 5v5 Ranked Flex games

            //query for multiple columns
            //var queryQueueType = await db.QueryAsync<DBMatch> ("select queueType, season from match where queueType = ? and season = ?", "RANKED_FLEX_SR", ("SEASON2017", "PRESEASON2017"));

            //query for multiple values in one colum
            //var queryQueueType = await db.QueryAsync<DBMatch> ("select season from match where season IN ('SEASON2017', 'PRESEASON2017')");
            //var queryQueueType2 = await db.QueryAsync<DBMatch> ("select season from match where season IN ('SEASON2017')");

            List<DBMatch> test = await db.QueryAsync<DBMatch> ("select * from match where queueType IN('TEAM_BUILDER_DRAFT_UNRANKED_5x5', 'TEAM_BUILDER_DRAFT_RANKED_5x5', 'RANKED_TEAM_5x5', 'RANKED_SOLO_5x5', 'RANKED_FLEX_SR')");
            return test;// db.QueryAsync<DBMatch> ("select * from match where queueType IN('TEAM_BUILDER_DRAFT_UNRANKED_5x5', 'TEAM_BUILDER_DRAFT_RANKED_5x5', 'RANKED_TEAM_5x5', 'RANKED_SOLO_5x5', 'RANKED_FLEX_SR')");
        }

        //TODO move to DBWriter
        internal void WriteStaticChampionData(Task<StaticChampionList> task)
        {
            StaticChampionList champs = task.Result;
            DBStaticChampion tempChamp;
            foreach(KeyValuePair<String, StaticChampion> kvp in champs.Data)
            {
                tempChamp = new DBStaticChampion(kvp.Value);
                Console.WriteLine("Write db: " + db.InsertAsync(tempChamp).Result + " inserted " + tempChamp.Name);
            }

        }

        public async Task<bool> IsMatchFoundAsync(long matchId)
        {
            List<DBMatch> matches = await db.QueryAsync<DBMatch> ("select * from match where gameId =?", matchId);
            return matches.Count > 0 ? true : false;
        }
    }
}