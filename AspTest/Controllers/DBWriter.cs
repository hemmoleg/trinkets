using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using asptest.Models;
using RiotNet.Models;

namespace asptest.Controllers
{
    public class DBWriter : DBAccessor
    {
        public void WriteMatchToDB(MatchReference matchRef, Match match)
        {
            var dbMatch = DBMatch.CreateFromApi(matchRef, match);
            dbMatch.UserIndex = getUserIndex(match) + 1;
            dbMatch.Outcome = match.Participants[getUserIndex(match)].Stats.Win ? 1 : 2;
            dbMatch.Team1Bans = getBannedChampsAsString(match, 0);
            dbMatch.Team2Bans = getBannedChampsAsString(match, 1);
            dbMatch.Title = getTitle(match);
            dbMatch.ID = GetBiggestIdAsync().Result + 1;
            

            //temp fix season
            if(dbMatch.Season == null)
            {
                if((int)matchRef.Season == 10)
                    dbMatch.Season = "PRESEASON2018";
                if((int)matchRef.Season == 11)
                    dbMatch.Season = "SEASON2018";
            }

            try
            {
                Console.WriteLine("Write dbMatch: " + DB.InsertAsync(dbMatch).Result);
            }
            catch(Exception ex)
            {
                Console.WriteLine("Could not write dbMatch to db: " + ex.Message);
            }

            writeParticpantsToDB(matchRef, match);
        }

        public DBMatch CreateDBMatch( MatchReference matchReference, Match match )
        {
            var dbMatch = DBMatch.CreateFromApi( matchReference, match );
            dbMatch.UserIndex = getUserIndex( match ) + 1;
            dbMatch.Outcome = match.Participants[ getUserIndex( match ) ].Stats.Win ? 1 : 2;
            dbMatch.Team1Bans = getBannedChampsAsString( match, 0 );
            dbMatch.Team2Bans = getBannedChampsAsString( match, 1 );
            dbMatch.Title = getTitle( match );
            dbMatch.ID = GetBiggestIdAsync().Result + 1;


            //temp fix season
            if( dbMatch.Season == null )
            {
                if( (int) matchReference.Season == 10 )
                    dbMatch.Season = "PRESEASON2018";
                if( (int) matchReference.Season == 11 )
                    dbMatch.Season = "SEASON2018";
            }

            return dbMatch;
        }

        private void writeParticpantsToDB(MatchReference matchRef, Match match)
        {
            var counter = 0;
            foreach(var matchParticipant in match.Participants)
            {
                var dbParticipant = DBParticipant.CreateFromApi(matchRef, match,
                    GetChampionNameByIdAsync(matchParticipant.ChampionId).Result, matchParticipant);
            
                try
                {
                    Console.WriteLine("Write dbParticipant " + counter + ": " + DB.InsertAsync(dbParticipant).Result);
                }
                catch(Exception ex)
                {
                    Console.WriteLine("Could not write dbParticipant to db: " + ex.Message);
                }
                counter++;
            }
        }

        internal void CreateTableStaticChampion()
        {
            DB.CreateTableAsync<DBStaticChampion>();
        }

        internal void WriteStaticChampionData(Task<StaticChampionList> task)
        {
            StaticChampionList champs = task.Result;
            foreach(KeyValuePair<String, StaticChampion> kvp in champs.Data)
            {
                var tempChamp = new DBStaticChampion(kvp.Value);
                Console.WriteLine("Write db: " + DB.InsertAsync(tempChamp).Result + " inserted " + tempChamp.Name);
            }

        }

        private string getTitle(Match match)
        {
            var championID = match.Participants[getUserIndex(match)].ChampionId;
            var championName = GetChampionNameByIdAsync(championID).Result;
            return championName + " (" + (GetGamesAsChampionAsync(championName).Result + 1) + ")";
        }

        private int getUserIndex(Match match)
        {
            foreach (var identity in match.ParticipantIdentities)
                if (identity.Player.AccountId == AccountID)
                    return identity.ParticipantId - 1;

            return -1;
        }

        private string getBannedChampsAsString(Match match, int team)
        {
            var bannedChampions = "";
            foreach (var bannedChampion in match.Teams[team].Bans) bannedChampions += bannedChampion.ChampionId + ",";
            return bannedChampions;
        }

        public void RemoveMatch(DBMatch match)
        {
            //var deletedMatches = await DB.DeleteAsync(match);
            var x = DB.ExecuteAsync( "DELETE FROM match WHERE id = ?", match.ID ).Result;
            Console.WriteLine("Deleted " + x + " matches ID: " + match.ID);

            x = DB.ExecuteAsync( "DELETE FROM event WHERE gameId = ?", match.GameId ).Result;
            Console.WriteLine( "Deleted " + x + " events ID: " + match.ID );

            x = DB.ExecuteAsync( "DELETE FROM filter WHERE gameId = ?", match.GameId ).Result;
            Console.WriteLine( "Deleted " + x + " filters ID: " + match.ID );

            x = DB.ExecuteAsync( "DELETE FROM participant WHERE gameId = ?", match.GameId ).Result;
            Console.WriteLine( "Deleted " + x + " participants ID: " + match.ID );

            x = DB.ExecuteAsync( "DELETE FROM participantFrame WHERE gameId = ?", match.GameId ).Result;
            Console.WriteLine( "Deleted " + x + " participantFrame ID: " + match.ID );

            Console.WriteLine("Removed all traces of match.ID: " + match.ID);
        }
    }
}