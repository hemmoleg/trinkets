using System.Collections.Generic;

namespace LoLStats.Models
{
    public class ChampMastery
    {
        public string Grade { get; set; }
    }

    public class LeagueDelta
    {
        public int LeaguePointDelta { get; set; }
        public IList<object> MiniSeriesProgress { get; set; }
        public string Reason { get; set; }
        public int Timestamp { get; set; }
    }

    public class PlatformDelta
    {
        public bool CompensationModeEnabled { get; set; }
        public int IpDelta { get; set; }
        public object Timestamp { get; set; }
        public int XpDelta { get; set; }
    }

    public class Delta
    {
        public ChampMastery ChampMastery { get; set; }
        public long GameId { get; set; }
        public string GamePlatformId { get; set; }
        public LeagueDelta LeagueDelta { get; set; }
        public PlatformDelta PlatformDelta { get; set; }
    }

    public class Grades
    {
        public Grades()
        {
            Deltas = new List<Delta>();
            OriginalAccountId = null;
            OriginalPlatformId = "";
        }

        public IList<Delta> Deltas { get; set; }
        public int? OriginalAccountId { get; set; }
        public string OriginalPlatformId { get; set; }

        public bool IsEmpty()
        {
            return Deltas.Count == 0 ? true : false;
        }
    }
}