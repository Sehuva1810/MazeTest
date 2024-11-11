using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using ValantDemoApi.Models;
using ValantDemoApi.Services;

namespace ValantDemoApi.Tests.Unit
{
    [TestFixture]
    public class MazeServiceTests
    {
        private MazeService _mazeService;
        private Mock<ILogger<MazeService>> _loggerMock;
        private Mock<IFormFile> _formFileMock;
        private CancellationToken _cancellationToken;

        [SetUp]
        public void Setup()
        {
            _loggerMock = new Mock<ILogger<MazeService>>();
            _mazeService = new MazeService(_loggerMock.Object);
            _formFileMock = new Mock<IFormFile>();
            _cancellationToken = CancellationToken.None;
        }

        [Test]
        public async Task ClearMazesAsync_ShouldRemoveAllMazesAndSessions()
        {
          // Arrange
          var mazeContent = @"XXXXX
XSOEX
XXXXX";
          SetupMockFile(mazeContent);
          var mazeId = await _mazeService.UploadMazeAsync(_formFileMock.Object, _cancellationToken);
          var session = await _mazeService.InitializeMazeAsync(mazeId, _cancellationToken);

          // Act
          await _mazeService.ClearMazesAsync(_cancellationToken);

          // Assert
          var availableMazes = await _mazeService.GetAvailableMazesAsync(_cancellationToken);
          availableMazes.Should().BeEmpty();

          Assert.ThrowsAsync<KeyNotFoundException>(async () =>
            await _mazeService.MakeNextMoveAsync(session.SessionId, Direction.Right, _cancellationToken));
        }

        [Test]
        public async Task UploadMazeAsync_WithValidContent_ShouldReturnMazeId()
        {
          // Arrange
          var mazeContent = @"XXXXX
XSOEX
XXXXX";
          SetupMockFile(mazeContent);

          // Act
          var mazeId = await _mazeService.UploadMazeAsync(_formFileMock.Object, _cancellationToken);

          // Assert
          mazeId.Should().NotBeNullOrEmpty();
          var availableMazes = await _mazeService.GetAvailableMazesAsync(_cancellationToken);
          availableMazes.Should().HaveCount(1);
          availableMazes[0].Id.Should().Be(mazeId);
        }

        [Test]
        public void UploadMazeAsync_WithInvalidContent_ShouldThrowException()
        {
          // Arrange
          var invalidMazeContent = @"XXXXX
XOOEX
XXXXX"; // Missing start position
          SetupMockFile(invalidMazeContent);

          // Act & Assert
          Assert.ThrowsAsync<InvalidOperationException>(async () =>
            await _mazeService.UploadMazeAsync(_formFileMock.Object, _cancellationToken));
        }

        [Test]
        public async Task InitializeMazeAsync_WithValidMazeId_ShouldReturnGameState()
        {
          // Arrange
          var mazeContent = @"XXXXX
XSOEX
XXXXX";
          SetupMockFile(mazeContent);
          var mazeId = await _mazeService.UploadMazeAsync(_formFileMock.Object, _cancellationToken);

          // Act
          var gameState = await _mazeService.InitializeMazeAsync(mazeId, _cancellationToken);

          // Assert
          gameState.Should().NotBeNull();
          gameState.SessionId.Should().NotBeEmpty();
          gameState.MazeId.Should().Be(mazeId);
          gameState.IsComplete.Should().BeFalse();
          gameState.CurrentPosition.Should().BeEquivalentTo(new Position { X = 1, Y = 1 });
          gameState.AvailableMoves.Should().Contain(Direction.Right);
        }

        [Test]
        public void InitializeMazeAsync_WithInvalidMazeId_ShouldThrowException()
        {
            // Act & Assert
            Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _mazeService.InitializeMazeAsync("invalid-id", _cancellationToken));
        }

        [Test]
        public async Task MakeNextMoveAsync_WithValidMove_ShouldUpdateGameState()
        {
            // Arrange
            var mazeContent = @"XXXXX
XSOEX
XXXXX";
            SetupMockFile(mazeContent);
            var mazeId = await _mazeService.UploadMazeAsync(_formFileMock.Object, _cancellationToken);
            var initialState = await _mazeService.InitializeMazeAsync(mazeId, _cancellationToken);

            // Act
            var newState = await _mazeService.MakeNextMoveAsync(initialState.SessionId, Direction.Right, _cancellationToken);

            // Assert
            newState.Should().NotBeNull();
            newState.CurrentPosition.Should().BeEquivalentTo(new Position { X = 2, Y = 1 });
            newState.IsComplete.Should().BeFalse();
        }

        [Test]
        public async Task MakeNextMoveAsync_ToExitPosition_ShouldCompleteGame()
        {
            // Arrange
            var mazeContent = @"XXXXX
XSOEX
XXXXX";
            SetupMockFile(mazeContent);
            var mazeId = await _mazeService.UploadMazeAsync(_formFileMock.Object, _cancellationToken);
            var gameState = await _mazeService.InitializeMazeAsync(mazeId, _cancellationToken);

            // Act - Move from S through O to E
            gameState = await _mazeService.MakeNextMoveAsync(gameState.SessionId, Direction.Right, _cancellationToken);
            gameState = await _mazeService.MakeNextMoveAsync(gameState.SessionId, Direction.Right, _cancellationToken);

            // Assert
            gameState.IsComplete.Should().BeTrue();
            gameState.AvailableMoves.Should().BeEmpty();
            gameState.CurrentPosition.Should().BeEquivalentTo(new Position { X = 3, Y = 1 });
        }

        [Test]
        public async Task MakeNextMoveAsync_AfterGameComplete_ShouldThrowException()
        {
            // Arrange
            var mazeContent = @"XXXXX
XSOEX
XXXXX";
            SetupMockFile(mazeContent);
            var mazeId = await _mazeService.UploadMazeAsync(_formFileMock.Object, _cancellationToken);
            var gameState = await _mazeService.InitializeMazeAsync(mazeId, _cancellationToken);

            // Move to exit
            gameState = await _mazeService.MakeNextMoveAsync(gameState.SessionId, Direction.Right, _cancellationToken);
            gameState = await _mazeService.MakeNextMoveAsync(gameState.SessionId, Direction.Right, _cancellationToken);

            // Act & Assert
            Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _mazeService.MakeNextMoveAsync(gameState.SessionId, Direction.Left, _cancellationToken));
        }

        [Test]
        public async Task GetAvailableMoves_ShouldReturnCorrectDirections()
        {
            // Arrange
            var mazeContent = @"XXXXX
XSOEX
XOXXX";  // O below S for testing Down movement
            SetupMockFile(mazeContent);
            var mazeId = await _mazeService.UploadMazeAsync(_formFileMock.Object, _cancellationToken);
            var gameState = await _mazeService.InitializeMazeAsync(mazeId, _cancellationToken);

            // Assert
            gameState.AvailableMoves.Should().Contain(Direction.Right);
            gameState.AvailableMoves.Should().Contain(Direction.Down);
            gameState.AvailableMoves.Should().NotContain(Direction.Up);
            gameState.AvailableMoves.Should().NotContain(Direction.Left);
        }

        private void SetupMockFile(string content)
        {
          var bytes = Encoding.UTF8.GetBytes(content);
          var stream = new MemoryStream(bytes);

          _formFileMock.Setup(f => f.Length).Returns(bytes.Length);
          _formFileMock.Setup(f => f.OpenReadStream()).Returns(stream);
          _formFileMock.Setup(f => f.FileName).Returns("test-maze.txt");
          _formFileMock.Setup(f => f.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
            .Callback<Stream, CancellationToken>((stream, token) =>
            {
              var ms = new MemoryStream(bytes);
              ms.CopyTo(stream);
            })
            .Returns(Task.CompletedTask);
        }
    }
}
