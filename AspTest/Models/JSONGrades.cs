using System.Collections.Generic;

namespace asptest.Models
{
    public class ChampMastery
    {
        public string grade { get; set; }
    }

    public class LeagueDelta
    {
        public int leaguePointDelta { get; set; }
        public IList<object> miniSeriesProgress { get; set; }
        public string reason { get; set; }
        public int timestamp { get; set; }
    }

    public class PlatformDelta
    {
        public bool compensationModeEnabled { get; set; }
        public int ipDelta { get; set; }
        public object timestamp { get; set; }
        public int xpDelta { get; set; }
    }

    public class Delta
    {
        public ChampMastery champMastery { get; set; }
        public object gameId { get; set; }
        public string gamePlatformId { get; set; }
        public LeagueDelta leagueDelta { get; set; }
        public PlatformDelta platformDelta { get; set; }
    }

    public class Grades
    {
        public IList<Delta> deltas { get; set; }
        public int originalAccountId { get; set; }
        public string originalPlatformId { get; set; }
    }
}