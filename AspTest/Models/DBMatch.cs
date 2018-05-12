namespace asptest.Models
{
    [SQLite.Table("match")]
    public class DBMatch
    {
        public long gameId {get; set;}
        public string region {get; set;}
        public long creation {get; set;}
        public string queueType {get; set;}
        public string season {get; set;}

    }
}