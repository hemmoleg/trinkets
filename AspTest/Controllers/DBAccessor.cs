using System;
using System.IO;
using System.Threading.Tasks;
using asptest.Models;
using SQLite;

namespace asptest.Controllers
{
    public class DBAccessor
    {
        protected SQLiteAsyncConnection DB;

        public DBAccessor()
        {
            //var databasePath = Path.Combine(Directory.GetCurrentDirectory(), "games_new.db");
            var databasePath = Path.Combine( Directory.GetCurrentDirectory(), "my_games_new.db" );
            Console.WriteLine("Using database: " + databasePath);
            try
            {
                DB = new SQLiteAsyncConnection( databasePath );
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public long AccountID { get; set; }

        public int GetBiggestIdAsync()
        {
            try
            {
                return DB.ExecuteScalarAsync<int>("select MAX(id) from match").Result;
            }
            catch(Exception e)
            {
                return 0;
            }
        } //db.rawQuery("SELECT MAX(price) FROM spendings", null)
        //await conn.ExecuteScalarAsync<int>("select count(*) from Stock");

        public async Task<string> GetChampionNameByIdAsync(int championId)
        {
            var matches = await DB.QueryAsync<DBStaticChampion>("select * from staticChampion where id =?", championId);
            return matches[0].Name;
        }

        public async Task<int> GetGamesAsChampionAsync(string champion)
        {
            var query = "select * from match where title LIKE '%" + champion.Replace( "'", "''" ) + "%'";
            var matches = await DB.QueryAsync<DBMatch>(query);
            return matches.Count;
        }
    }
}