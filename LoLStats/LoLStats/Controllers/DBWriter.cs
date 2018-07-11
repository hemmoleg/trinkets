using System;
using System.Threading.Tasks;
using LoLStats.Models;
using Microsoft.AspNetCore.SignalR;
using RiotNet.Models;

namespace LoLStats.Controllers
{
    public class DBWriter : DBAccessor
    {
        public IHubContext<ChatHub> hub { get; set; }

        public void WriteMatchToDB(MatchReference matchRef, Match match, string grade)
        {
            var dbMatch = DBMatch.CreateFromApi(matchRef, match);
            dbMatch.UserIndex = getUserIndex(match) + 1;
            dbMatch.Outcome = match.Participants[getUserIndex(match)].Stats.Win ? 1 : 2;
            dbMatch.Team1Bans = getBannedChampsAsString(match, 0);
            dbMatch.Team2Bans = getBannedChampsAsString(match, 1);
            dbMatch.Title = getMatchTitle(match);
            dbMatch.ID = GetBiggestID() + 1;
            dbMatch.Grade = grade;

            try
            {
                DB.InsertAsync(dbMatch);
                addMessageToConsole("Writing match " + dbMatch.Title + " Grade: " + dbMatch.Grade + " id: " + match.GameId);
                Console.WriteLine( "Writing match " + dbMatch.Title + " id: " + dbMatch.ID );
            }
            catch(Exception ex)
            {
                addMessageToConsole( "Could not write dbMatch to db: " + ex.Message );
                Console.WriteLine("Could not write dbMatch to db: " + ex.Message);
            }

            writeParticpantsToDB(matchRef, match);
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
                    DB.InsertAsync(dbParticipant);
                    //addMessageToConsole( "Write dbParticipant " + counter + ": 1" );
                    Console.WriteLine( "Write dbParticipant " + counter + ": 1");
                }
                catch(Exception ex)
                {
                    addMessageToConsole( "Could not write dbParticipant to db: " + ex.Message );
                    Console.WriteLine("Could not write dbParticipant to db: " + ex.Message);
                }
                counter++;
            }
        }

        private string getMatchTitle(Match match)
        {
            var championID = match.Participants[getUserIndex(match)].ChampionId;
            var championName = GetChampionNameByIdAsync(championID).Result;
            return championName + " (" + (GetGameCountAsChampionAsync(championName).Result + 1) + ")";
        }

        private int getUserIndex(Match match)
        {
            foreach (var identity in match.ParticipantIdentities)
                if (identity.Player.AccountId == AccountID)
                    return identity.ParticipantId - 1;

            return -1;
        }

        private static string getBannedChampsAsString(Match match, int team)
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

        internal void WriteStaticChampionData(Task<StaticChampionList> task)
        {
            var champs = task.Result;
            foreach(var kvp in champs.Data)
            {
                var champion = DBStaticChampion.CreateFromApi(kvp.Value);
                Console.WriteLine("Write db: " + DB.InsertAsync(champion).Result + " inserted " + champion.Name);
            }

        }

        public void WriteStaticItemData(Task<StaticItemList> task)
        {
            var items = task.Result;
            foreach( var kvp in items.Data )
            {
                var item = DBStaticItem.CreateFromApi(kvp.Value);
                Console.WriteLine( "Write db: " + DB.InsertAsync( item ).Result + " inserted " + item.Name );
            }

        }

        internal void CreateTable<T>( ) where T : new()
        {
            DB.CreateTableAsync<T>();
        }

        public async void AddGradeToMatch(DBMatch match, string champMasteryGrade)
        {
            match.Grade = champMasteryGrade;
            await DB.UpdateAsync(match);
        }

        private void addMessageToConsole( string message )
        {
            //var hub = (IHubContext<ChatHub>) this.HttpContext.RequestServices.GetService<IHubContext<ChatHub>>();
            hub.Clients.All.SendAsync( "AddMessageToConsole", "MainController", message );
        }
    }
}