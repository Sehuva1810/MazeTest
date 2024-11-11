using System.Collections.Generic;
using Newtonsoft.Json;

namespace ValantDemoApi.Models
{
  public class GameState
  {
    [JsonProperty("sessionId")]
    public string SessionId { get; set; }

    [JsonProperty("mazeId")]
    public string MazeId { get; set; }

    [JsonProperty("currentPosition")]
    public Position CurrentPosition { get; set; }

    [JsonProperty("isComplete")]
    public bool IsComplete { get; set; }

    [JsonProperty("availableMoves")]
    public List<Direction> AvailableMoves { get; set; } = new List<Direction>();
  }

}
