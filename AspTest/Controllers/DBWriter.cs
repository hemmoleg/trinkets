using System;
using asptest.Models;
using RiotNet.Models;

namespace asptest.Controllers
{
    public class DBWriter : DBAccessor
    {
        public DBMatch WriteMatchToDB(MatchReference matchRef, Match match)
        {
            var dbMatch = new DBMatch
            {
                GameId = matchRef.GameId,
                Region = matchRef.PlatformId,
                Creation = (long) (matchRef.Timestamp - new DateTime(1970, 1, 1)).TotalMilliseconds,

                QueueType = Enum.GetName(typeof(QueueType), matchRef.Queue),
                Season = Enum.GetName(typeof(Season), matchRef.Season),

                //should be done by DB
                //dbMatch.id = getBiggestIdAsync().Result + 1;

                Duration = (int) match.GameDuration.TotalSeconds,
                MapId = match.MapId,
                Version = match.GameVersion,
                UserIndex = getUserIndex(match),
                WinningTeam = match.Teams[0].Win ? 1 : 2,
                Outcome = match.Participants[getUserIndex(match)].Stats.Win ? 1 : 2,
                Team1Bans = getBannedChampsAsString(match, 0),
                Team2Bans = getBannedChampsAsString(match, 1),
                Title = getTitle(match),
                Uploaded = false,
                ReplayName = "no_replay",
                Grade = "C"
            };
            return dbMatch;
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
    }
}