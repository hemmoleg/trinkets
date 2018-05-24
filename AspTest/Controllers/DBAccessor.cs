using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using asptest.Models;
using SQLite;

namespace asptest.Controllers
{
    public class DBAccessor
    {
        protected SQLiteAsyncConnection db;
        protected SQLiteConnection db2;

        public long AccountID { get; set; }

        public DBAccessor()
        {
            string databasePath = Path.Combine(Directory.GetCurrentDirectory(), "games_new.db");
            db = new SQLiteAsyncConnection(databasePath);
            db2 = new SQLiteConnection(databasePath);
        }

        public Task<int> GetBiggestIdAsync()
        {
            return db.ExecuteScalarAsync<int>("select MAX(id) from match");
        }   //db.rawQuery("SELECT MAX(price) FROM spendings", null)
            //await conn.ExecuteScalarAsync<int>("select count(*) from Stock");

        public async Task<String> GetChampionNameByIdAsync( int championId )
        {
            List<DBStaticChampion> matches = await db.QueryAsync<DBStaticChampion>( "select * from staticChampion where id =?", championId );
            return matches[ 0 ].Name;
        }

        public async Task<int> GetGamesAsChampionAsync( string champion )
        {
            string query = "select * from match where title LIKE '%" + champion + "%'";
            List<DBMatch> matches = await db.QueryAsync<DBMatch>( query );
            return matches.Count;
        }
    }
}