namespace asptest.Models
{
    [SQLite.Table("match")]
    public class DBMatch
    {
        [SQLite.Column ("gameId")]
        public long GameId {get; set;}

        [SQLite.Column ("region")]
        public string Region {get; set;} // platformId in riotSharp/JSON
        
        [SQLite.Column ("creation")]
        public long Creation {get; set;} //creation -> MatchReference.Timestamp
        
        [SQLite.Column ("queueType")]
        public string QueueType {get; set;} //queueType -> MatchReference.Queue
        
        [SQLite.Column ("season")]
        public string Season {get; set;} //season -> MathReference.Season
        
        [SQLite.Column ("id")]
        public int ID{get; set;} //id -> get biggest id and increment
        
        [SQLite.Column ("duration")]
        public int Duration{get;set;} //duration ->  RiotClient.getMatchAsync(matchID).gameDuration
        
        [SQLite.Column ("mapId")]
        public int MapId{get;set;} //mapID -> RiotClient.getMatchAsync(matchID).mapId
        
        [SQLite.Column ("version")]
        public string Version{get;set;} //version -> RiotClient.getMatchAsync(matchID).GameVersion
        
        [SQLite.Column ("userIndex")]
        public int UserIndex{get;set;} //userIndex -> recentMatch.Participants[identity.ParticipantId-1]
        
        [SQLite.Column ("winningTeam")]
        public int WinningTeam{get;set;}//winningTeam -> RiotClient.getMatchAsync(matchID).Teams[].Win -> 
                                        //   find winning team, then get its TeamID
        
        [SQLite.Column ("outcome")]
        public int Outcome{get;set;} //outcome -> 1 == win for me    2 == lose for me
        
        [SQLite.Column ("team1Bans")]
        public string Team1Bans{get;set;} //team1/2Bans RiotClient.getMatchAsync(matchID).Teams[].Bans
        
        [SQLite.Column ("team2Bans")]
        public string Team2Bans{get;set;} 
        
        [SQLite.Column ("title")]
        public string Title{get;set;} //title -> champion name + regex...
        
        [SQLite.Column ("uploaded")]
        public bool Uploaded{get;set;} //uploaded -> 0
        
        [SQLite.Column ("replayName")]
        public string ReplayName{get;set;} //replayName -> "no_replay"
        
        [SQLite.Column ("partial")]
        public bool Partial{get;set;} //partial -> null
        
        [SQLite.Column ("grade")]
        public string Grade{get;set;} //grade -> getRecentGameGrades

        //TODO add MatchReference.Lane
        //TODO add MatchReference.Role
    }
}