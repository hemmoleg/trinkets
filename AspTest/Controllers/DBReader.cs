using System;
using System.Collections.Generic;
using System.Reflection.Metadata.Ecma335;
using System.Threading.Tasks;
using asptest.Models;
using RiotNet.Models;

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
    }
}