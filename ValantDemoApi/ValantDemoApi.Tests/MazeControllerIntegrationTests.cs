using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Newtonsoft.Json;
using NUnit.Framework;
using ValantDemoApi.Models;

namespace ValantDemoApi.Tests
{
    [TestFixture]
    public class MazeControllerTests
    {
        private WebApplicationFactory<Program> _factory;
        private HttpClient _client;
        private const string ValidMazeContent = @"SOXXXXXXXX
OOOXXXXXXX
OXOOOXOOOO
XXXXOXOXXO
OOOOOOOXXO
OXXOXXXXXO
OOOOXXXXXE";

        [OneTimeSetUp]
        public void SetUp()
        {
            _factory = new WebApplicationFactory<Program>();
            _client = _factory.CreateClient();
        }

        [OneTimeTearDown]
        public void TearDown()
        {
            _client.Dispose();
            _factory.Dispose();
        }

        [SetUp]
        public async Task TestSetup()
        {
            await _client.DeleteAsync("/api/maze/clear");
        }

        [Test]
        public async Task GetAvailableMazes_WhenNoMazes_ReturnsEmptyList()
        {
            // Act
            var response = await _client.GetAsync("/api/maze/available");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var content = await response.Content.ReadAsStringAsync();
            var mazes = JsonConvert.DeserializeObject<List<MazeDefinition>>(content);
            mazes.Should().BeEmpty();
        }

        [Test]
        public async Task UploadAndRetrieveMaze_Success()
        {
            // Arrange
            var content = new MultipartFormDataContent();
            var fileBytes = Encoding.UTF8.GetBytes(ValidMazeContent);
            var fileContent = new ByteArrayContent(fileBytes);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("text/plain");
            content.Add(fileContent, "file", "maze.txt");

            // Act - Upload
            var uploadResponse = await _client.PostAsync("/api/maze/upload", content);

            // Assert - Upload
            uploadResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            var uploadContent = await uploadResponse.Content.ReadAsStringAsync();
            var mazeId = JsonConvert.DeserializeObject<string>(uploadContent);
            mazeId.Should().NotBeNullOrEmpty();

            // Act - Retrieve
            var getResponse = await _client.GetAsync("/api/maze/available");

            // Assert - Retrieve
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            var retrievedContent = await getResponse.Content.ReadAsStringAsync();
            var mazes = JsonConvert.DeserializeObject<List<MazeDefinition>>(retrievedContent);

            mazes.Should().NotBeEmpty();
            var maze = mazes.Should().ContainSingle().Subject;
            maze.Id.Should().Be(mazeId);
            maze.Grid.Should().NotBeNull();
            maze.Start.Should().NotBeNull();
            maze.Exit.Should().NotBeNull();
        }

        [Test]
        public async Task InitializeMaze_ValidId_ReturnsGameState()
        {
            // Arrange - Upload maze first
            var mazeId = await UploadValidMaze();

            // Act
            var initResponse = await _client.PostAsync($"/api/maze/initialize/{mazeId}", null);

            // Assert
            initResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            var responseContent = await initResponse.Content.ReadAsStringAsync();
            var gameState = JsonConvert.DeserializeObject<GameState>(responseContent);

            gameState.Should().NotBeNull();
            gameState.SessionId.Should().NotBeEmpty();
            gameState.MazeId.Should().Be(mazeId);
            gameState.AvailableMoves.Should().NotBeEmpty();
            gameState.CurrentPosition.Should().BeEquivalentTo(new Position { X = 0, Y = 0 });
        }

        [Test]
        public async Task MakeMove_ValidMove_UpdatesPosition()
        {
            // Arrange
            var gameState = await InitializeValidMaze();

            // Act - Move right from start
            var moveContent = new StringContent(
                JsonConvert.SerializeObject(Direction.Right),
                Encoding.UTF8,
                "application/json");

            var moveResponse = await _client.PostAsync(
                $"/api/maze/move/{gameState.SessionId}",
                moveContent);

            // Assert
            moveResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            var responseContent = await moveResponse.Content.ReadAsStringAsync();
            var updatedState = JsonConvert.DeserializeObject<GameState>(responseContent);

            updatedState.Should().NotBeNull();
            updatedState.CurrentPosition.X.Should().Be(1);
            updatedState.CurrentPosition.Y.Should().Be(0);
            updatedState.SessionId.Should().Be(gameState.SessionId);
        }

[Test]
public async Task CompleteGame_SuccessfullyReachExit()
{
    // Arrange
    var gameState = await InitializeValidMaze();

    Console.WriteLine("Initial Maze:");
    PrintMaze(ValidMazeContent, gameState.CurrentPosition);

    var moves = new[]
    {
        Direction.Right,
        Direction.Down,
        Direction.Right,
        Direction.Down,
        Direction.Right,
        Direction.Right,
        Direction.Down,
        Direction.Down,
        Direction.Right,
        Direction.Right,
        Direction.Up,
        Direction.Up,
        Direction.Right,
        Direction.Right,
        Direction.Right,
        Direction.Down,
        Direction.Down,
        Direction.Down,
        Direction.Down
    };

    GameState currentState = gameState;
    var moveNumber = 0;

    foreach (var move in moves)
    {
        moveNumber++;
        Console.WriteLine($"\nAttempting move #{moveNumber}: {move}");
        Console.WriteLine($"Current position: ({currentState.CurrentPosition.X}, {currentState.CurrentPosition.Y})");

        var moveContent = new StringContent(
            JsonConvert.SerializeObject(move),
            Encoding.UTF8,
            "application/json");

        var response = await _client.PostAsync(
            $"/api/maze/move/{currentState.SessionId}",
            moveContent);

        if (response.StatusCode != HttpStatusCode.OK)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            Console.WriteLine("\nCurrent maze state when move failed:");
            PrintMaze(ValidMazeContent, currentState.CurrentPosition);
            throw new Exception($"Move {move} failed at position ({currentState.CurrentPosition.X}, {currentState.CurrentPosition.Y}). Error: {errorContent}");
        }

        var responseContent = await response.Content.ReadAsStringAsync();
        currentState = JsonConvert.DeserializeObject<GameState>(responseContent);

        Console.WriteLine($"New position: ({currentState.CurrentPosition.X}, {currentState.CurrentPosition.Y})");
        Console.WriteLine("\nMaze after move:");
        PrintMaze(ValidMazeContent, currentState.CurrentPosition);
        Console.WriteLine($"Available moves: {string.Join(", ", currentState.AvailableMoves)}");
    }

    // Assert we've reached the exit
    currentState.IsComplete.Should().BeTrue("The game should be complete when reaching the exit");
    currentState.CurrentPosition.Should().BeEquivalentTo(new Position { X = 9, Y = 6 }, "Should be at the exit position");
    currentState.AvailableMoves.Should().BeEmpty("No moves should be available after reaching the exit");
}

private void PrintMaze(string mazeContent, Position currentPos)
{
    var lines = mazeContent.Split('\n');
    Console.WriteLine("   0123456789");
    for (int y = 0; y < lines.Length; y++)
    {
        Console.Write($"{y,2} ");
        for (int x = 0; x < lines[y].Length; x++)
        {
            if (x == currentPos.X && y == currentPos.Y)
            {
                Console.Write('P');
            }
            else
            {
                Console.Write(lines[y][x]);
            }
        }
        Console.WriteLine();
    }
}

        [Test]
        public async Task MakeMove_InvalidMove_ReturnsBadRequest()
        {
            // Arrange
            var gameState = await InitializeValidMaze();

            // Act - Try to move left into a wall
            var moveContent = new StringContent(
                JsonConvert.SerializeObject(Direction.Left),
                Encoding.UTF8,
                "application/json");

            var moveResponse = await _client.PostAsync(
                $"/api/maze/move/{gameState.SessionId}",
                moveContent);

            // Assert
            moveResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Test]
        public async Task UploadMaze_WithInvalidContent_ReturnsBadRequest()
        {
            // Arrange
            var content = new MultipartFormDataContent();
            var invalidContent = "INVALID";
            var fileBytes = Encoding.UTF8.GetBytes(invalidContent);
            var fileContent = new ByteArrayContent(fileBytes);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("text/plain");
            content.Add(fileContent, "file", "maze.txt");

            // Act
            var response = await _client.PostAsync("/api/maze/upload", content);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        private async Task<string> UploadValidMaze()
        {
            var content = new MultipartFormDataContent();
            var fileBytes = Encoding.UTF8.GetBytes(ValidMazeContent);
            var fileContent = new ByteArrayContent(fileBytes);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("text/plain");
            content.Add(fileContent, "file", "maze.txt");

            var response = await _client.PostAsync("/api/maze/upload", content);
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var uploadContent = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<string>(uploadContent);
        }

        private async Task<GameState> InitializeValidMaze()
        {
            var mazeId = await UploadValidMaze();
            var initResponse = await _client.PostAsync($"/api/maze/initialize/{mazeId}", null);
            initResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            return JsonConvert.DeserializeObject<GameState>(
                await initResponse.Content.ReadAsStringAsync());
        }
    }
}
