using RiotNet.Models;
using SQLite;

namespace asptest.Models
{
    [Table("staticChampion")]
    public class DBStaticChampion
    {
        private StaticChampion value;

        public DBStaticChampion()
        {
        }

        public DBStaticChampion(StaticChampion value)
        {
            Id = value.Id;
            Key = value.Key;
            Name = value.Name;
            Title = value.Title;
        }

        [Column("id")] public int Id { get; set; }

        [Column("key")] public string Key { get; set; }

        [Column("name")] public string Name { get; set; }

        [Column("title")] public string Title { get; set; }
    }
}