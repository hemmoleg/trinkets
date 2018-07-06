using SQLite;

namespace LoLStats.Models
{
    [Table("item")]
    public class DBItem
    {
        [Column("id")] public int Id { get; set; }

        public string name { get; set; }
        public bool final { get; set; }
        public bool consumable { get; set; }
        public int cost { get; set; }
        public string buildsFrom { get; set; }
    }
}