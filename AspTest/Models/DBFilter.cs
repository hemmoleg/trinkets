
using RiotNet.Models;

namespace asptest.Models
{
    public class DBFilter : DBParticipant
    {
        //TODO fix naming in tables (e.g. match.Creation should be "Creation" in table)
        public int ID { get; set; }
        public long Creation { get; set; }
        public int Duration { get; set; }
        public string QueueType { get; set; }
        public int MapID { get; set; }
        public string Season { get; set; }
        public string Version { get; set; }
        public int UserIndex { get; set; }
        public int WinningTeam { get; set; }
        public int Outcome { get; set; }
        public string Team1Bans { get; set; }
        public string Team2Bans { get; set; }
        public string Title { get; set; }
        public string Grade { get; set; }

        protected static DBFilter CreateFromInstances( DBParticipant participant, DBMatch match)
        {
            return new DBFilter()
            {
                //participant stuff
                GameId = match.GameId,
                Region = participant.Region,
                ParticipantId = participant.ParticipantId,
                TeamId = (int) participant.TeamId,
                ChampionId = participant.ChampionId,
                Spell1Id = participant.Spell1Id,
                Spell2Id = participant.Spell2Id,
                Name = participant.Name,
                ChampionName = participant.ChampionName,
                Winner = participant.Winner,
                ChampLevel = participant.ChampLevel,
                Item0 = participant.Item0,
                Item1 = participant.Item1,
                Item2 = participant.Item2,
                Item3 = participant.Item3,
                Item4 = participant.Item4,
                Item5 = participant.Item5,
                Item6 = participant.Item6,
                Kills = participant.Kills,
                DoubleKills = participant.DoubleKills,
                TripleKills = participant.TripleKills,
                QuadraKills = participant.QuadraKills,
                PentaKills = participant.PentaKills,
                UnrealKills = participant.UnrealKills,
                LargestKillingSpree = participant.LargestKillingSpree,
                Deaths = participant.Deaths,
                Assists = participant.Assists,
                TotalDamageDealt = participant.TotalDamageDealt,
                TotalDamageDealtToChampions = participant.TotalDamageDealtToChampions,
                TotalDamageTaken = participant.TotalDamageTaken,
                LargestCriticalStrike = participant.LargestCriticalStrike,
                TotalHeal = participant.TotalHeal,
                MinionsKilled = participant.MinionsKilled,
                NeutralMinionsKilled = participant.NeutralMinionsKilled,
                NeutralMinionsKilledTeamJungle = participant.NeutralMinionsKilledTeamJungle,
                NeutralMinionsKilledEnemyJungle = participant.NeutralMinionsKilledEnemyJungle,
                GoldEarned = participant.GoldEarned,
                GoldSpent = participant.GoldSpent,
                CombatPlayerScore = participant.CombatPlayerScore,
                ObjectivePlayerScore = participant.ObjectivePlayerScore,
                TotalPlayerScore = participant.TotalPlayerScore,
                TotalScoreRank = participant.TotalScoreRank,
                MagicDamageDealtToChampions = participant.MagicDamageDealtToChampions,
                PhysicalDamageDealtToChampions = participant.PhysicalDamageDealtToChampions,
                TrueDamageDealtToChampions = participant.TrueDamageDealtToChampions,
                VisionWardsBoughtInGame = participant.VisionWardsBoughtInGame,
                SightWardsBoughtInGame = participant.SightWardsBoughtInGame,
                MagicDamageDealt = participant.MagicDamageDealt,
                PhysicalDamageDealt = participant.PhysicalDamageDealt,
                TrueDamageDealt = participant.TrueDamageDealt,
                MagicDamageTaken = participant.MagicDamageTaken,
                PhysicalDamageTaken = participant.PhysicalDamageTaken,
                TrueDamageTaken = participant.TrueDamageTaken,
                FirstBloodKill = participant.FirstBloodKill,
                FirstBloodAssist = participant.FirstBloodAssist,
                FirstTowerKill = participant.FirstTowerKill,
                FirstTowerAssist = participant.FirstTowerAssist,
                FirstInhibitorKill = participant.FirstInhibitorKill,
                FirstInhibitorAssist = participant.FirstInhibitorAssist,
                InhibitorKills = participant.InhibitorKills,
                TowerKills = participant.TowerKills,
                WardsPlaced = participant.WardsPlaced,
                WardsKilled = participant.WardsKilled,
                LargestMultiKill = participant.LargestMultiKill,
                KillingSprees = participant.KillingSprees,
                TotalUnitsHealed = participant.TotalUnitsHealed,
                TotalTimeCrowdControlDealt = participant.TotalTimeCrowdControlDealt
            };
        }
    }

}
