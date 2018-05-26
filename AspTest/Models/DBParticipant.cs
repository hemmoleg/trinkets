using SQLite;

namespace asptest.Models
{
    [Table("participant")]
    public class DBParticipant
    {
        public int gameId { get; set; }
        public string region { get; set; }
        public int participantId { get; set; }
        public int teamId { get; set; }
        public int championId { get; set; }
        public int spell1Id { get; set; }
        public int spell2Id { get; set; }
        public string name { get; set; }
        public string championName { get; set; }
        public bool winner { get; set; } // win in json!
        public int champLevel { get; set; }
        public int item2 { get; set; }
        public int item3 { get; set; }
        public int item0 { get; set; }
        public int item1 { get; set; }
        public int item6 { get; set; }
        public int item4 { get; set; }
        public int item5 { get; set; }
        public int kills { get; set; }
        public int doubleKills { get; set; }
        public int tripleKills { get; set; }
        public int quadraKills { get; set; }
        public int pentaKills { get; set; }
        public int unrealKills { get; set; }
        public int largestKillingSpree { get; set; }
        public int deaths { get; set; }
        public int assists { get; set; }
        public int totalDamageDealt { get; set; }
        public int totalDamageDealtToChampions { get; set; }
        public int totalDamageTaken { get; set; }
        public int largestCriticalStrike { get; set; }
        public int totalHeal { get; set; }
        public int minionsKilled { get; set; } //totalMisionKilled
        public int neutralMinionsKilled { get; set; }
        public int neutralMinionsKilledTeamJungle { get; set; }
        public int neutralMinionsKilledEnemyJungle { get; set; }
        public int goldEarned { get; set; }
        public int goldSpent { get; set; }
        public int combatPlayerScore { get; set; }
        public int objectivePlayerScore { get; set; }
        public int totalPlayerScore { get; set; }
        public int totalScoreRank { get; set; }
        public int physicalDamageDealtToChampions { get; set; }
        public int magicDamageDealtToChampions { get; set; }
        public int trueDamageDealtToChampions { get; set; }
        public int visionWardsBoughtInGame { get; set; }
        public int sightWardsBoughtInGame { get; set; }
        public int magicDamageDealt { get; set; }
        public int physicalDamageDealt { get; set; }
        public int trueDamageDealt { get; set; }
        public int magicalDamageTaken { get; set; }
        public int physicalDamageTaken { get; set; }
        public int trueDamageTaken { get; set; }
        public bool firstBloodKill { get; set; }
        public bool firstBloodAssist { get; set; }
        public bool firstTowerKill { get; set; }
        public bool firstTowerAssist { get; set; }
        public bool firstInhibitorKill { get; set; }
        public bool firstInhibitorAssist { get; set; }
        public int inhibitorKills { get; set; }
        public int towerKills { get; set; } // turretKills in JSON
        public int wardsPlaced { get; set; }
        public int wardsKilled { get; set; }
        public int largestMultiKill { get; set; }
        public int killingSprees { get; set; }
        public int totalUnitsHealed { get; set; }
        public int totalTimeCrowdControlDealt { get; set; }

        //NOT used in lolreplayDB
        /*public int visionScore { get; set; }
        public int longestTimeSpentLiving { get; set; }
        public int damageDealtToTurrets { get; set; }
        public int damageDealtToObjectives { get; set; }
        public int damageSelfMitigated { get; set; }
        public int timeCCingOthers { get; set; }
        public string highestAchievedSeasonTier { get; set; }*/
    }
}