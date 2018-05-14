using RiotNet.Models;

namespace asptest.Models
{
    [SQLite.Table ("staticChampion")]
    public class DBStaticChampion
    {
        private StaticChampion value;

        public DBStaticChampion(){}
        public DBStaticChampion(StaticChampion value)
        {
            this.Id = value.Id;
            this.Key = value.Key;
            this.Name = value.Name;
            this.Title = value.Title;
        }

        [SQLite.Column ("id")]
        public int Id { get; set; }
        [SQLite.Column ("key")]
        public string Key { get; set; }
        [SQLite.Column ("name")]
        public string Name { get; set; }
        [SQLite.Column ("title")]
        public string Title { get; set; }
    }
}