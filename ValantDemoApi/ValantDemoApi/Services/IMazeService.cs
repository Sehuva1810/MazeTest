using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using ValantDemoApi.Models;

namespace ValantDemoApi.Services
{
  public interface IMazeService
  {
    Task<string> UploadMazeAsync(IFormFile mazeFile, CancellationToken cancellationToken = default);
    Task<List<MazeDefinition>> GetAvailableMazesAsync(CancellationToken cancellationToken = default);
    Task<GameState> InitializeMazeAsync(string mazeId, CancellationToken cancellationToken = default);
    Task<GameState> MakeNextMoveAsync(string sessionId, Direction direction, CancellationToken cancellationToken = default);
    Task ClearMazesAsync(CancellationToken cancellationToken = default);
  }
}
