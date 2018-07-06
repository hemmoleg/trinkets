using RiotNet.Models;
using SQLite;

namespace LoLStats.Models
{
    [Table("staticChampion")]
    public class DBStaticChampion
    {
        public static DBStaticChampion CreateFromApi(StaticChampion value)
        {
            return new DBStaticChampion()
            {
                Id = value.Id,
                Key = value.Key,
                Name = value.Name,
                Title = value.Title,
            };
        }

        [Column("id")][Unique]public int Id { get; set; }

        [Column("key")] public string Key { get; set; }

        [Column("name")][Unique] public string Name { get; set; }

        [Column("title")] public string Title { get; set; }
    }

    [Table( "staticItem" )]
    public class DBStaticItem
    {
        public static DBStaticItem CreateFromApi(StaticItem value)
        {
            return new DBStaticItem()
            {
                From = value.From.Value,
                Description = value.Description,
                TotalCost = value.Gold.Total,
                PlainText = value.PlainText,
                ImageFull = value.Image.Full,
                ImageSprite = value.Image.Sprite,
                Id = value.Id,
                Name = value.Name,
                
            };
        }

        [Column("id")][Unique] public int Id { get; set; }

        [Column( "from" )] public string From { get; set; }

        [Column( "description" )] public string Description { get; set; }

        [Column( "totalCost" )] public int TotalCost { get; set; }

        [Column("plainText")] public string PlainText { get; set; }

        [Column("imageFull")] public string ImageFull { get; set; }

        [Column("imageSprite")] public string ImageSprite { get; set; }

        [Column("name")] public string Name { get; set; }

        
    }

    
}