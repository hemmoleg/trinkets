using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace asptest.Models
{
    public class DBFilter : DBParticipant
    {
        public int ID { get; set; }
        public long Creation {get; set;}
        public int Duration { get; set; }
        public string QueueType { get; set; }
        public int MapID { get; set; }
        public string Season { get; set; }
        public string Version { get; set; }
        public int UserIndex { get; set; }
        public int WinningTeam { get; set; }
        public int Outcome { get; set; }
        public string Team1Bans { get; set; }
        public string Team2Bans { get; set; }
        public string Title { get; set; }
        public string Grade { get; set; }
    }
}
