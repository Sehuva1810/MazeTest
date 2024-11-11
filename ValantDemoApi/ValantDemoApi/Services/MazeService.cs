using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using ValantDemoApi.Models;

namespace ValantDemoApi.Services
{
  public class MazeService : IMazeService
{
    private readonly ILogger<MazeService> _logger;
    private readonly SemaphoreSlim _mazeLock = new SemaphoreSlim(1, 1);
    private readonly SemaphoreSlim _sessionLock = new SemaphoreSlim(1, 1);
    private readonly IDictionary<string, MazeDefinition> _mazes;
    private readonly IDictionary<string, GameState> _activeSessions;

    private const int MAX_MAZE_SIZE = 1000;
    private const int MIN_MAZE_SIZE = 2;
    private const long MAX_FILE_SIZE = 1024 * 1024;

    public MazeService(ILogger<MazeService> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _mazes = new Dictionary<string, MazeDefinition>();
        _activeSessions = new Dictionary<string, GameState>();
    }

    public async Task<string> UploadMazeAsync(IFormFile mazeFile, CancellationToken cancellationToken = default)
    {
      if (mazeFile == null)
        throw new ArgumentNullException(nameof(mazeFile));

      if (mazeFile.Length == 0 || mazeFile.Length > MAX_FILE_SIZE)
        throw new InvalidOperationException($"File size must be between 1 and {MAX_FILE_SIZE} bytes");

      try
      {
        _logger.LogInformation("Processing maze upload: {fileName}", mazeFile.FileName);

        using var stream = new MemoryStream();
        await mazeFile.CopyToAsync(stream, cancellationToken);
        stream.Position = 0;

        using var reader = new StreamReader(stream);
        var content = await reader.ReadToEndAsync();

        content = content.Replace("\r\n", "\n").Replace("\r", "\n");

        await ValidateMazeContentAsync(content, cancellationToken);
        var maze = await ParseMazeFileAsync(content, Path.GetFileNameWithoutExtension(mazeFile.FileName), cancellationToken);

        await _mazeLock.WaitAsync(cancellationToken);
        try
        {
          _mazes[maze.Id] = maze;
        }
        finally
        {
          _mazeLock.Release();
        }

        _logger.LogInformation("Maze uploaded successfully. ID: {mazeId}", maze.Id);
        return maze.Id;
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Failed to upload maze file: {fileName}", mazeFile.FileName);
        throw new InvalidOperationException("Failed to process maze file", ex);
      }
    }
    public async Task<List<MazeDefinition>> GetAvailableMazesAsync(CancellationToken cancellationToken = default)
    {
        await _mazeLock.WaitAsync(cancellationToken);
        try
        {
            return _mazes.Values.ToList();
        }
        finally
        {
            _mazeLock.Release();
        }
    }

    public async Task<GameState> InitializeMazeAsync(string mazeId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(mazeId))
            throw new ArgumentNullException(nameof(mazeId));

        MazeDefinition maze;
        await _mazeLock.WaitAsync(cancellationToken);
        try
        {
            if (!_mazes.TryGetValue(mazeId, out maze))
            {
                _logger.LogWarning("Maze not found: {mazeId}", mazeId);
                throw new KeyNotFoundException($"Maze not found: {mazeId}");
            }
        }
        finally
        {
            _mazeLock.Release();
        }

        var sessionId = Guid.NewGuid().ToString();
        var gameState = new GameState
        {
            SessionId = sessionId,
            MazeId = mazeId,
            CurrentPosition = maze.Start,
            AvailableMoves = GetAvailableMoves(maze, maze.Start),
            IsComplete = false
        };

        await _sessionLock.WaitAsync(cancellationToken);
        try
        {
            _activeSessions[sessionId] = gameState;
        }
        finally
        {
            _sessionLock.Release();
        }

        _logger.LogInformation("Maze session initialized. SessionId: {sessionId}", sessionId);
        return gameState;
    }

    public async Task<GameState> MakeNextMoveAsync(string sessionId, Direction direction, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(sessionId))
            throw new ArgumentNullException(nameof(sessionId));

        GameState gameState;
        MazeDefinition maze;

        await _sessionLock.WaitAsync(cancellationToken);
        try
        {
            if (!_activeSessions.TryGetValue(sessionId, out gameState))
            {
                throw new KeyNotFoundException("Session not found");
            }

            if (gameState.IsComplete)
            {
                throw new InvalidOperationException("Game is already complete");
            }

            await _mazeLock.WaitAsync(cancellationToken);
            try
            {
                maze = _mazes[gameState.MazeId];
            }
            finally
            {
                _mazeLock.Release();
            }

            var newPosition = CalculateNewPosition(gameState.CurrentPosition, direction);

            if (!IsValidMove(maze, newPosition))
            {
                throw new InvalidOperationException($"Invalid move: {direction}");
            }

            gameState.CurrentPosition = newPosition;
            gameState.IsComplete = IsAtExit(maze, newPosition);
            gameState.AvailableMoves = gameState.IsComplete
                ? new List<Direction>()
                : GetAvailableMoves(maze, newPosition);

            _activeSessions[sessionId] = gameState;

            if (gameState.IsComplete)
            {
                _logger.LogInformation("Game completed. SessionId: {sessionId}", sessionId);
            }
        }
        finally
        {
            _sessionLock.Release();
        }

        return gameState;
    }

    public async Task ClearMazesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await Task.WhenAll(
                Task.Run(async () =>
                {
                    await _mazeLock.WaitAsync(cancellationToken);
                    try
                    {
                        _mazes.Clear();
                    }
                    finally
                    {
                        _mazeLock.Release();
                    }
                }, cancellationToken),
                Task.Run(async () =>
                {
                    await _sessionLock.WaitAsync(cancellationToken);
                    try
                    {
                        _activeSessions.Clear();
                    }
                    finally
                    {
                        _sessionLock.Release();
                    }
                }, cancellationToken)
            );

            _logger.LogInformation("Cleared all mazes and active sessions");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while clearing mazes");
            throw;
        }
    }

 private async Task ValidateMazeContentAsync(string content, CancellationToken cancellationToken)
    {
        await Task.Run(() =>
        {
            if (string.IsNullOrWhiteSpace(content))
                throw new InvalidOperationException("Maze content cannot be empty");

            var lines = content.Split('\n', StringSplitOptions.RemoveEmptyEntries);

            if (lines.Length < MIN_MAZE_SIZE || lines.Length > MAX_MAZE_SIZE)
                throw new InvalidOperationException($"Maze must be between {MIN_MAZE_SIZE} and {MAX_MAZE_SIZE} rows");

            var width = lines[0].Length;
            if (width < MIN_MAZE_SIZE || width > MAX_MAZE_SIZE)
                throw new InvalidOperationException($"Maze width must be between {MIN_MAZE_SIZE} and {MAX_MAZE_SIZE} columns");

            bool hasStart = false;
            bool hasExit = false;

            for (int y = 0; y < lines.Length; y++)
            {
                if (lines[y].Length != width)
                    throw new InvalidOperationException("All maze rows must have the same width");

                for (int x = 0; x < lines[y].Length; x++)
                {
                    char cell = lines[y][x];
                    switch (cell)
                    {
                        case 'S':
                            if (hasStart)
                                throw new InvalidOperationException("Maze cannot have multiple start positions");
                            hasStart = true;
                            break;
                        case 'E':
                            if (hasExit)
                                throw new InvalidOperationException("Maze cannot have multiple exit positions");
                            hasExit = true;
                            break;
                        case 'O':
                        case 'X':
                            break;
                        default:
                            throw new InvalidOperationException($"Invalid character in maze: {cell}");
                    }
                }
            }

            if (!hasStart || !hasExit)
                throw new InvalidOperationException("Maze must have exactly one start (S) and one exit (E) position");
        }, cancellationToken);
    }

 private async Task<MazeDefinition> ParseMazeFileAsync(string content, string name, CancellationToken cancellationToken)
 {
   return await Task.Run(() =>
   {
     var lines = content.Split('\n', StringSplitOptions.RemoveEmptyEntries);
     Position start = null;
     Position exit = null;

     for (int y = 0; y < lines.Length; y++)
     {
       for (int x = 0; x < lines[y].Length; x++)
       {
         if (lines[y][x] == 'S')
         {
           start = new Position { X = x, Y = y };
           _logger.LogInformation("Start found at position ({X}, {Y})", x, y);
         }
         else if (lines[y][x] == 'E')
         {
           exit = new Position { X = x, Y = y };
           _logger.LogInformation("Exit found at position ({X}, {Y})", x, y);
         }
       }
     }

     return new MazeDefinition
     {
       Id = Guid.NewGuid().ToString(),
       Name = name,
       Grid = string.Join("\n", lines),
       Start = start,
       Exit = exit
     };
   }, cancellationToken);
 }

 private List<Direction> GetAvailableMoves(MazeDefinition maze, Position position)
 {
   var moves = new List<Direction>();
   var directions = new[]
   {
     (Direction.Up, 0, -1),
     (Direction.Down, 0, 1),
     (Direction.Right, 1, 0),
     (Direction.Left, -1, 0)
   };

   foreach (var (direction, dx, dy) in directions)
   {
     var newPosition = new Position
     {
       X = position.X + dx,
       Y = position.Y + dy
     };

     if (IsValidMove(maze, newPosition))
     {
       moves.Add(direction);
     }
   }

   return moves;
 }

    private bool IsValidMove(MazeDefinition maze, Position position)
    {
      var lines = maze.Grid.Split('\n');

      if (position.Y < 0 || position.Y >= lines.Length ||
          position.X < 0 || position.X >= lines[0].Length)
      {
        return false;
      }

      char cell = lines[position.Y][position.X];

      return cell == 'O' || cell == 'E' || cell == 'S';
    }


    private bool IsAtExit(MazeDefinition maze, Position position)
    {
      var lines = maze.Grid.Split('\n');
      if (position.Y < 0 || position.Y >= lines.Length ||
          position.X < 0 || position.X >= lines[0].Length)
      {
        return false;
      }

      return lines[position.Y][position.X] == 'E';
    }

    private Position CalculateNewPosition(Position current, Direction direction)
    {
        var (dx, dy) = direction switch
        {
            Direction.Up => (0, -1),
            Direction.Down => (0, 1),
            Direction.Right => (1, 0),
            Direction.Left => (-1, 0),
            _ => throw new ArgumentException($"Invalid direction: {direction}")
        };

        return new Position
        {
            X = current.X + dx,
            Y = current.Y + dy
        };
    }

    public void Dispose()
    {
        _mazeLock?.Dispose();
        _sessionLock?.Dispose();
    }


}
}
