using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Threading.Tasks;
using asptest.Models;
using Newtonsoft.Json.Linq;
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

            var test = await DB.QueryAsync<DBMatch>(
                "select * from match where queueType IN('TEAM_BUILDER_DRAFT_UNRANKED_5x5', 'TEAM_BUILDER_DRAFT_RANKED_5x5', 'RANKED_TEAM_5x5', 'RANKED_SOLO_5x5', 'RANKED_FLEX_SR')");
            return
                test; // db.QueryAsync<DBMatch> ("select * from match where queueType IN('TEAM_BUILDER_DRAFT_UNRANKED_5x5', 'TEAM_BUILDER_DRAFT_RANKED_5x5', 'RANKED_TEAM_5x5', 'RANKED_SOLO_5x5', 'RANKED_FLEX_SR')");
        }

        public async Task<bool> IsMatchFoundAsync(long matchId)
        {
            var matches = await DB.QueryAsync<DBMatch>("select * from match where gameId =?", matchId);
            return matches.Count > 0 ? true : false;
        }

        public async Task<bool> IsDatabaseValidAsync()
        {
            var x = await DB.ExecuteScalarAsync<int>(
                "SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = 'match'");
            if (x == 0) return false;

            x = await DB.ExecuteScalarAsync<int>(
                "SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = 'filter'" );
            if( x == 0 ) return false;

            x = await DB.ExecuteScalarAsync<int>(
                "SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = 'participant'" );
            if( x == 0 ) return false;

            return true;
        }

        public async Task<bool> IsTablePresent(string tableName)
        {
            var x = await DB.ExecuteScalarAsync<int>(
                "SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = '" + tableName + "'");

            Console.WriteLine(x == 1 ? tableName + " valid" : tableName + " NOT valid!");

            return x != 0;
        }

        public async Task<DBMatch> GetMatchByIDAsync(long matchId)
        {
            try
            {
                return await DB.GetAsync<DBMatch>( ( dbMatch ) => dbMatch.GameId == matchId );
            }
            catch( InvalidOperationException e )
            {
                Console.WriteLine( "Match with id: " + matchId + " not found " + e.Message );
                return null;
            }
        }

        public async Task<JObject> GetWinrateByChampID(int id)
        {
            var championName = GetChampionNameByIdAsync(id).Result;
            var query = "select * from match where title LIKE '%" + championName.Replace( "'", "''" ) + "%'";
            var matches = await DB.QueryAsync<DBMatch>( query );

            //data total
            var wins = matches.Count(match => match.Outcome == 1);
            float winrate = ( (float) wins / matches.Count) * 100;

            dynamic jsonObj = new JObject();
            jsonObj.Wins = wins;
            jsonObj.WinRate = Math.Round(winrate, 2);
            jsonObj.GameCount = matches.Count;


            //data last 3 Months
            var matchesLast3Months = new List<DBMatch>();
            foreach (var match in matches)
            {
                var time = DateTime.UtcNow - new DateTime( 1970, 1, 1 ) - new TimeSpan( 90, 0, 0, 0 );
                if( match.Creation > time.TotalMilliseconds )
                {
                    matchesLast3Months.Add(match);
                }
            }

            wins = matchesLast3Months.Count( match => match.Outcome == 1 );
            winrate = ( (float) wins / matchesLast3Months.Count ) * 100;

            jsonObj.Wins3Months = wins;
            jsonObj.WinRate3Months = Math.Round( winrate, 2 );
            jsonObj.GameCount3Months = matchesLast3Months.Count;

            //data last 14 Days
            var matchesLast14Days = new List<DBMatch>();
            foreach( var match in matchesLast14Days )
            {
                var time = DateTime.UtcNow - new DateTime( 1970, 1, 1 ) - new TimeSpan( 14, 0, 0, 0 );
                if( match.Creation > time.TotalMilliseconds )
                {
                    matchesLast14Days.Add( match );
                }
            }

            wins = matchesLast14Days.Count( match => match.Outcome == 1 );
            winrate = ( (float) wins / matchesLast14Days.Count ) * 100;

            jsonObj.Wins2Weeks = wins;
            jsonObj.WinRate2Weeks = Math.Round( winrate, 2 );
            jsonObj.GameCount2Weeks = matchesLast14Days.Count;

            return jsonObj;
        }

        public async Task<List<DBMatch>> GetMatchesByChampID( int id )
        {
            var championName = GetChampionNameByIdAsync( id ).Result;
            var query = "select * from match where title LIKE '%" + championName.Replace( "'", "''" ) + "%'";
            var matches = await DB.QueryAsync<DBMatch>( query );

            return matches;
        }

        private class ChampionName
        {
            // ReSharper disable once InconsistentNaming
            public string championName
            {
                get; set;
            }
        }

        public async Task<List<DBStaticChampion>> GetAllPlayedChampions(string userName)
        {
            var roughList = await DB.QueryAsync<ChampionName>("select distinct championName from participant where name = '" + userName + "'");
            var champions = new List<DBStaticChampion>();
            foreach (var championName in roughList)
            {
                champions.Add( DB.QueryAsync<DBStaticChampion>( "select * from staticChampion where name = \"" + championName.championName + "\"" ).Result[0]);
            }

            return champions;
        }
    }
}