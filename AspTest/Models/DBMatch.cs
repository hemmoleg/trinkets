namespace asptest.Models
{
    [SQLite.Table("match")]
    public class DBMatch
    {
        public long GameId {get; set;}
        public string Region {get; set;} // platformId in riotSharp/JSON
        public long Creation {get; set;} //creation -> MatchReference.Timestamp
        public string QueueType {get; set;} //queueType -> MatchReference.Queue
        public string Season {get; set;} //season -> MathReference.Season
        public int ID{get; set;} //id -> get biggest id and increment
        public int Duration{get;set;} //duration ->  RiotClient.getMatchAsync(matchID).gameDuration
        public int MapId{get;set;} //mapID -> RiotClient.getMatchAsync(matchID).mapId
        public string Version{get;set;} //version -> RiotClient.getMatchAsync(matchID).GameVersion
        public int UserIndex{get;set;} //userIndex -> recentMatch.Participants[identity.ParticipantId-1]
        public int WinningTeam{get;set;}//winningTeam -> RiotClient.getMatchAsync(matchID).Teams[].Win -> 
                                        //   find winning team, then get its TeamID
        public int Outcome{get;set;} //outcome -> 1 == win for me    2 == lose for me
        public string Team1Bans{get;set;} //team1/2Bans RiotClient.getMatchAsync(matchID).Teams[].Bans
        public string Team2Bans{get;set;} 
        public string Title{get;set;} //title -> champion name + regex...
        public bool Uploaded{get;set;} //uploaded -> 0
        public string ReplayName{get;set;} //replayName -> "no_replay"
        public bool Partial{get;set;} //partial -> null
        public string Grade{get;set;} //grade -> getRecentGameGrades

        //TODO add MatchReference.Lane
    }
}