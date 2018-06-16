using RiotNet.Models;
using SQLite;

namespace asptest.Models
{
    [Table("participant")]
    public class DBParticipant
    {
        [Indexed(Name = "participantUnique", Order = 1, Unique = true)]
        public long GameId {get; set;}
        public string Region{get; set;}
        [Indexed(Name = "participantUnique", Order = 2, Unique = true)]
        public int ParticipantId { get; set; }

        [SQLite.Column ("teamId")]
        public int TeamId { get; set; }

        [SQLite.Column ("championId")]
        public int ChampionId { get; set; }

        [SQLite.Column ("spell1Id")]
        public int Spell1Id { get; set; }

        [SQLite.Column ("spell2Id")]
        public int Spell2Id { get; set; }

        [SQLite.Column( "name" )]
        public string Name { get; set; }
        [SQLite.Column( "championName" )]
        public string ChampionName { get; set; }
        [SQLite.Column( "winner" )]
        public bool Winner { get; set; }
        [SQLite.Column( "champLevel" )]// win in json!
        public int ChampLevel { get; set; }
        [SQLite.Column( "item2" )]
        public int Item2 { get; set; }
        [SQLite.Column( "item3" )]
        public int Item3 { get; set; }
        [SQLite.Column( "item0" )]
        public int Item0 { get; set; }
        [SQLite.Column( "item1" )]
        public int Item1 { get; set; }
        [SQLite.Column( "item6" )]
        public int Item6 { get; set; }
        [SQLite.Column( "item4" )]
        public int Item4 { get; set; }
        [SQLite.Column( "item5" )]
        public int Item5 { get; set; }
        [SQLite.Column( "kills" )]
        public int Kills { get; set; }
        [SQLite.Column( "doubleKills" )]
        public int DoubleKills { get; set; }
        [SQLite.Column( "tripleKills" )]
        public int TripleKills { get; set; }
        [SQLite.Column( "quadraKills" )]
        public int QuadraKills { get; set; }
        [SQLite.Column( "pentaKills" )]
        public int PentaKills { get; set; }
        [SQLite.Column( "unrealKills" )]
        public int UnrealKills { get; set; }
        [SQLite.Column( "largestKillingSpree" )]
        public int LargestKillingSpree { get; set; }
        [SQLite.Column( "deaths" )]
        public int Deaths { get; set; }
        [SQLite.Column( "assists" )]
        public int Assists { get; set; }
        [SQLite.Column( "totalDamageDealt" )]
        public long TotalDamageDealt { get; set; }
        [SQLite.Column( "totalDamageDealtToChampions" )]
        public long TotalDamageDealtToChampions { get; set; }
        [SQLite.Column( "totalDamageTaken" )]
        public long TotalDamageTaken { get; set; }
        [SQLite.Column( "largestCriticalStrike" )]
        public int LargestCriticalStrike { get; set; }
        [SQLite.Column( "totalHeal" )]
        public long TotalHeal { get; set; }
        [SQLite.Column( "minionsKilled" )]
        public int MinionsKilled { get; set; } //totalMisionKilled
        [SQLite.Column( "neutralMinionsKilled" )]
        public int NeutralMinionsKilled { get; set; }
        [SQLite.Column( "neutralMinionsKilledTeamJungle" )]
        public int NeutralMinionsKilledTeamJungle { get; set; }
        [SQLite.Column( "neutralMinionsKilledEnemyJungle" )]
        public int NeutralMinionsKilledEnemyJungle { get; set; }
        [SQLite.Column( "goldEarned" )]
        public long GoldEarned { get; set; }
        [SQLite.Column( "goldSpent" )]
        public int GoldSpent { get; set; }
        [SQLite.Column( "combatPlayerScore" )]
        public int CombatPlayerScore { get; set; }
        [SQLite.Column( "objectivePlayerScore" )]
        public int ObjectivePlayerScore { get; set; }
        [SQLite.Column( "totalPlayerScore" )]
        public int TotalPlayerScore { get; set; }
        [SQLite.Column( "totalScoreRank" )]
        public int TotalScoreRank { get; set; }
        [SQLite.Column( "physicalDamageDealtToChampions" )]
        public long PhysicalDamageDealtToChampions { get; set; }
        [SQLite.Column( "magicDamageDealtToChampions" )]
        public long MagicDamageDealtToChampions { get; set; }
        [SQLite.Column( "trueDamageDealtToChampions" )]
        public long TrueDamageDealtToChampions { get; set; }
        [SQLite.Column( "visionWardsBoughtInGame" )]
        public int VisionWardsBoughtInGame { get; set; }
        [SQLite.Column( "sightWardsBoughtInGame" )]
        public int SightWardsBoughtInGame { get; set; }
        [SQLite.Column( "magicDamageDealt" )]
        public long MagicDamageDealt { get; set; }
        [SQLite.Column( "physicalDamageDealt" )]
        public long PhysicalDamageDealt { get; set; }
        [SQLite.Column( "trueDamageDealt" )]
        public long TrueDamageDealt { get; set; }
        [SQLite.Column( "magicDamageTaken" )]
        public long MagicDamageTaken { get; set; }
        [SQLite.Column( "physicalDamageTaken" )]
        public long PhysicalDamageTaken { get; set; }
        [SQLite.Column( "trueDamageTaken" )]
        public long TrueDamageTaken { get; set; }
        [SQLite.Column( "firstBloodKill" )]
        public bool FirstBloodKill { get; set; }
        [SQLite.Column( "firstBloodAssist" )]
        public bool FirstBloodAssist { get; set; }
        [SQLite.Column( "firstTowerKill" )]
        public bool FirstTowerKill { get; set; }
        [SQLite.Column( "firstTowerAssist" )]
        public bool FirstTowerAssist { get; set; }
        [SQLite.Column( "firstInhibitorKill" )]
        public bool FirstInhibitorKill { get; set; }
        [SQLite.Column( "firstInhibitorAssist" )]
        public bool FirstInhibitorAssist { get; set; }
        [SQLite.Column( "inhibitorKills" )]
        public int InhibitorKills { get; set; }
        [SQLite.Column( "towerKills" )]
        public int TowerKills { get; set; } // turretKills in JSON
        [SQLite.Column( "wardsPlaced" )]
        public int WardsPlaced { get; set; }
        [SQLite.Column( "wardsKilled" )]
        public int WardsKilled { get; set; }
        [SQLite.Column( "largestMultiKill" )]
        public int LargestMultiKill { get; set; }
        [SQLite.Column( "killingSprees" )]
        public int KillingSprees { get; set; }
        [SQLite.Column( "totalUnitsHealed" )]
        public long TotalUnitsHealed { get; set; }
        [SQLite.Column( "totalTimeCrowdControlDealt" )]
        public int TotalTimeCrowdControlDealt { get; set; }


        //NOT used in lolreplayDB
        /*public int visionScore { get; set; }
        public int longestTimeSpentLiving { get; set; }
        public int damageDealtToTurrets { get; set; }
        public int damageDealtToObjectives { get; set; }
        public int damageSelfMitigated { get; set; }
        public int timeCCingOthers { get; set; }
        public string highestAchievedSeasonTier { get; set; }*/

        public static DBParticipant CreateFromApi( MatchReference matchReference, Match match, string championName, MatchParticipant matchParticipant )
        {
            return new DBParticipant
            {
                GameId = match.GameId,
                Region = matchReference.PlatformId.Substring(0,3),
                ParticipantId = matchParticipant.ParticipantId,
                TeamId = (int) matchParticipant.TeamId,
                ChampionId = matchParticipant.ChampionId,
                Spell1Id = matchParticipant.Spell1Id,
                Spell2Id = matchParticipant.Spell2Id,
                Name = match.ParticipantIdentities[matchParticipant.ParticipantId - 1].Player.SummonerName,
                ChampionName = championName,
                Winner = matchParticipant.Stats.Win,
                ChampLevel = matchParticipant.Stats.ChampLevel,
                Item0 = matchParticipant.Stats.Item0,
                Item1 = matchParticipant.Stats.Item1,
                Item2 = matchParticipant.Stats.Item2,
                Item3 = matchParticipant.Stats.Item3,
                Item4 = matchParticipant.Stats.Item4,
                Item5 = matchParticipant.Stats.Item5,
                Item6 = matchParticipant.Stats.Item6,
                Kills = matchParticipant.Stats.Kills,
                DoubleKills = matchParticipant.Stats.DoubleKills,
                TripleKills = matchParticipant.Stats.TripleKills,
                QuadraKills = matchParticipant.Stats.QuadraKills,
                PentaKills = matchParticipant.Stats.PentaKills,
                UnrealKills = matchParticipant.Stats.UnrealKills,
                LargestKillingSpree = matchParticipant.Stats.LargestKillingSpree,
                Deaths = matchParticipant.Stats.Deaths,
                Assists = matchParticipant.Stats.Assists,
                TotalDamageDealt = matchParticipant.Stats.TotalDamageDealt,
                TotalDamageDealtToChampions = matchParticipant.Stats.TotalDamageDealtToChampions,
                TotalDamageTaken = matchParticipant.Stats.TotalDamageTaken,
                LargestCriticalStrike = matchParticipant.Stats.LargestCriticalStrike,
                TotalHeal = matchParticipant.Stats.TotalHeal,
                MinionsKilled = matchParticipant.Stats.TotalMinionsKilled,
                NeutralMinionsKilled = matchParticipant.Stats.NeutralMinionsKilled,
                NeutralMinionsKilledTeamJungle = matchParticipant.Stats.NeutralMinionsKilledTeamJungle,
                NeutralMinionsKilledEnemyJungle = matchParticipant.Stats.NeutralMinionsKilledEnemyJungle,
                GoldEarned = matchParticipant.Stats.GoldEarned,
                GoldSpent = matchParticipant.Stats.GoldSpent,
                CombatPlayerScore = matchParticipant.Stats.CombatPlayerScore,
                ObjectivePlayerScore = matchParticipant.Stats.ObjectivePlayerScore,
                TotalPlayerScore = matchParticipant.Stats.TotalPlayerScore,
                TotalScoreRank = matchParticipant.Stats.TotalScoreRank,
                MagicDamageDealtToChampions = matchParticipant.Stats.MagicDamageDealtToChampions,
                PhysicalDamageDealtToChampions = matchParticipant.Stats.PhysicalDamageDealtToChampions,
                TrueDamageDealtToChampions = matchParticipant.Stats.TrueDamageDealtToChampions,
                VisionWardsBoughtInGame = matchParticipant.Stats.VisionWardsBoughtInGame,
                SightWardsBoughtInGame = matchParticipant.Stats.SightWardsBoughtInGame,
                MagicDamageDealt = matchParticipant.Stats.MagicDamageDealt,
                PhysicalDamageDealt = matchParticipant.Stats.PhysicalDamageDealt,
                TrueDamageDealt = matchParticipant.Stats.TrueDamageDealt,
                MagicDamageTaken = matchParticipant.Stats.MagicalDamageTaken,
                PhysicalDamageTaken = matchParticipant.Stats.PhysicalDamageTaken,
                TrueDamageTaken = matchParticipant.Stats.TrueDamageTaken,
                FirstBloodKill = matchParticipant.Stats.FirstBloodKill,
                FirstBloodAssist = matchParticipant.Stats.FirstBloodAssist,
                FirstTowerKill = matchParticipant.Stats.FirstTowerKill,
                FirstTowerAssist = matchParticipant.Stats.FirstTowerAssist,
                FirstInhibitorKill = matchParticipant.Stats.FirstInhibitorKill,
                FirstInhibitorAssist = matchParticipant.Stats.FirstInhibitorAssist,
                InhibitorKills = matchParticipant.Stats.InhibitorKills,
                TowerKills = matchParticipant.Stats.TowerKills,
                WardsPlaced = matchParticipant.Stats.WardsPlaced,
                WardsKilled = matchParticipant.Stats.WardsKilled,
                LargestMultiKill = matchParticipant.Stats.LargestMultiKill,
                KillingSprees = matchParticipant.Stats.KillingSprees,
                TotalUnitsHealed = matchParticipant.Stats.TotalUnitsHealed,
                TotalTimeCrowdControlDealt = matchParticipant.Stats.TotalTimeCrowdControlDealt
            };
        }
    }
}