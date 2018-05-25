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
            DBMatch dbMatch = new DBMatch
            {
                GameId = matchRef.GameId,
                Region = matchRef.PlatformId,
                Creation = (long)( matchRef.Timestamp.ToLocalTime() - new DateTime( 1970, 1, 1 ) ).TotalMilliseconds,

                QueueType = Enum.GetName( typeof( QueueType ), matchRef.Queue ),
                Season = Enum.GetName( typeof( Season ), matchRef.Season ),
                //id
                Duration = (int) match.GameDuration.TotalSeconds,
                MapId = match.MapId,
                Version = match.GameVersion,
                UserIndex = getUserIndex( match ),
                WinningTeam = match.Teams[0].Win ? 1 : 2,
                Outcome = match.Participants[ getUserIndex( match ) ].Stats.Win ? 1 : 2,
                Team1Bans = getBannedChampsAsString(match, 0),
                Team2Bans = getBannedChampsAsString(match, 1),
                Title = getTitle(match),
                Uploaded = false,
                ReplayName = "no_replay",
                Grade = "C"

            };
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
                Console.WriteLine("Write dbMatch: " + db.InsertAsync(dbMatch).Result);
            }
            catch(Exception ex)
            {
                Console.WriteLine("Could not write to db: " + ex.Message);
            }

            WriteParticpantsToDB(matchRef, match);
        }

        private void WriteParticpantsToDB(MatchReference matchRef, Match match)
        {
            var counter = 0;
            foreach(var matchParticipant in match.Participants)
            {
                var dbParticipant = new DBParticipant();
                
                dbParticipant.gameId = match.GameId;
                dbParticipant.region = matchRef.PlatformId;
                dbParticipant.participantId = matchParticipant.ParticipantId;
                dbParticipant.teamId = (int)matchParticipant.TeamId;
                dbParticipant.championId = matchParticipant.ChampionId;
                dbParticipant.spell1Id = matchParticipant.Spell1Id;
                dbParticipant.spell2Id = matchParticipant.Spell2Id;
                dbParticipant.name = match.ParticipantIdentities[matchParticipant.ParticipantId - 1].Player.SummonerName;
                dbParticipant.championName = GetChampionNameByIdAsync(matchParticipant.ChampionId).Result;
                dbParticipant.winner = matchParticipant.Stats.Win;
                dbParticipant.champLevel = matchParticipant.Stats.ChampLevel;
                dbParticipant.item0 = matchParticipant.Stats.Item0;
                dbParticipant.item1 = matchParticipant.Stats.Item1;
                dbParticipant.item2 = matchParticipant.Stats.Item2;
                dbParticipant.item3 = matchParticipant.Stats.Item3;
                dbParticipant.item4 = matchParticipant.Stats.Item4;
                dbParticipant.item5 = matchParticipant.Stats.Item5;
                dbParticipant.item6 = matchParticipant.Stats.Item6;
                dbParticipant.kills = matchParticipant.Stats.Kills;
                dbParticipant.doubleKills = matchParticipant.Stats.DoubleKills;
                dbParticipant.tripleKills = matchParticipant.Stats.TripleKills;
                dbParticipant.quadraKills = matchParticipant.Stats.QuadraKills;
                dbParticipant.pentaKills = matchParticipant.Stats.PentaKills;
                dbParticipant.unrealKills = matchParticipant.Stats.UnrealKills;
                dbParticipant.largestKillingSpree = matchParticipant.Stats.LargestKillingSpree;
                dbParticipant.deaths = matchParticipant.Stats.Deaths;
                dbParticipant.assists = matchParticipant.Stats.Assists;
                dbParticipant.totalDamageDealt = matchParticipant.Stats.TotalDamageDealt;
                dbParticipant.totalDamageDealtToChampions = matchParticipant.Stats.TotalDamageDealtToChampions;
                dbParticipant.totalDamageTaken = matchParticipant.Stats.TotalDamageTaken;
                dbParticipant.largestCriticalStrike = matchParticipant.Stats.LargestCriticalStrike;
                dbParticipant.totalHeal = matchParticipant.Stats.TotalHeal;
                dbParticipant.minionsKilled = matchParticipant.Stats.TotalMinionsKilled;
                dbParticipant.neutralMinionsKilled = matchParticipant.Stats.NeutralMinionsKilled;
                dbParticipant.neutralMinionsKilledTeamJungle = matchParticipant.Stats.NeutralMinionsKilledTeamJungle;
                dbParticipant.neutralMinionsKilledEnemyJungle = matchParticipant.Stats.NeutralMinionsKilledEnemyJungle;
                dbParticipant.goldEarned = matchParticipant.Stats.GoldEarned;
                dbParticipant.goldSpent = matchParticipant.Stats.GoldSpent;
                dbParticipant.combatPlayerScore = matchParticipant.Stats.CombatPlayerScore;
                dbParticipant.objectivePlayerScore = matchParticipant.Stats.ObjectivePlayerScore;
                dbParticipant.totalPlayerScore = matchParticipant.Stats.TotalPlayerScore;
                dbParticipant.totalScoreRank = matchParticipant.Stats.TotalScoreRank;
                dbParticipant.magicDamageDealtToChampions = matchParticipant.Stats.MagicDamageDealtToChampions;
                dbParticipant.physicalDamageDealtToChampions = matchParticipant.Stats.PhysicalDamageDealtToChampions;
                dbParticipant.trueDamageDealtToChampions = matchParticipant.Stats.TrueDamageDealtToChampions;
                dbParticipant.visionWardsBoughtInGame = matchParticipant.Stats.VisionWardsBoughtInGame;
                dbParticipant.sightWardsBoughtInGame = matchParticipant.Stats.SightWardsBoughtInGame;
                dbParticipant.magicDamageDealt = matchParticipant.Stats.MagicDamageDealt;
                dbParticipant.physicalDamageDealt = matchParticipant.Stats.PhysicalDamageDealt;
                dbParticipant.trueDamageDealt = matchParticipant.Stats.TrueDamageDealt;
                dbParticipant.magicDamageTaken = matchParticipant.Stats.MagicalDamageTaken;
                dbParticipant.physicalDamageTaken = matchParticipant.Stats.PhysicalDamageTaken;
                dbParticipant.trueDamageTaken = matchParticipant.Stats.TrueDamageTaken;
                dbParticipant.firstBloodKill = matchParticipant.Stats.FirstBloodKill;
                dbParticipant.firstBloodAssist = matchParticipant.Stats.FirstBloodAssist;
                dbParticipant.firstTowerKill = matchParticipant.Stats.FirstTowerKill;
                dbParticipant.firstTowerAssist = matchParticipant.Stats.FirstTowerAssist;
                dbParticipant.firstInhibitorKill = matchParticipant.Stats.FirstInhibitorKill;
                dbParticipant.firstInhibitorAssist = matchParticipant.Stats.FirstInhibitorAssist;
                dbParticipant.inhibitorKills = matchParticipant.Stats.InhibitorKills;
                dbParticipant.towerKills = matchParticipant.Stats.TowerKills;
                dbParticipant.wardsPlaced = matchParticipant.Stats.WardsPlaced;
                dbParticipant.wardsKilled = matchParticipant.Stats.WardsKilled;
                dbParticipant.largestMultiKill = matchParticipant.Stats.LargestMultiKill;
                dbParticipant.killingSprees = matchParticipant.Stats.KillingSprees;
                dbParticipant.totalUnitsHealed = matchParticipant.Stats.TotalUnitsHealed;
                dbParticipant.totalTimeCrowdControlDealt = matchParticipant.Stats.TotalTimeCrowdControlDealt;
            
                try
                {
                    Console.WriteLine("Write dbParticipant " + counter + ": " + db.InsertAsync(dbParticipant).Result);
                }
                catch(Exception ex)
                {
                    Console.WriteLine("Could not write to db: " + ex.Message);
                }
                counter++;
            }
        }

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

        private string getTitle(Match match)
        {
            var championID = match.Participants[getUserIndex(match)].ChampionId;
            var championName = GetChampionNameByIdAsync(championID).Result;
            return championName + " (" + (int)(GetGamesAsChampionAsync(championName).Result + 1) + ")";
        }

        private int getUserIndex(Match match)
        {
            foreach (MatchParticipantIdentity identity in match.ParticipantIdentities)
            {
                if (identity.Player.AccountId == this.AccountID)
                {
                    return identity.ParticipantId - 1;
                }
            }

            return -1;
        }

        private string getBannedChampsAsString( Match match, int team )
        {
            string bannedChampions = "";
            foreach( BannedChampion bannedChampion in match.Teams[ team ].Bans )
            {
                bannedChampions += bannedChampion.ChampionId + ",";
            }
            return bannedChampions;
        }
    }
}