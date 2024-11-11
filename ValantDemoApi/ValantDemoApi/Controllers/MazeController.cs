using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ValantDemoApi.Models;
using ValantDemoApi.Services;

namespace ValantDemoApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class MazeController : ControllerBase
    {
        private readonly IMazeService _mazeService;
        private readonly ILogger<MazeController> _logger;

        public MazeController(IMazeService mazeService, ILogger<MazeController> logger)
        {
            _mazeService = mazeService ?? throw new ArgumentNullException(nameof(mazeService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpPost("upload")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<string>> UploadMazeAsync(
            IFormFile file,
            CancellationToken cancellationToken)
        {
            if (file == null || file.Length == 0)
            {
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Invalid Request",
                    detail: "No file uploaded");
            }

            try
            {
                var mazeId = await _mazeService.UploadMazeAsync(file, cancellationToken);
                return Ok(mazeId);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Failed to upload maze");
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Invalid Maze",
                    detail: ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error uploading maze");
                return Problem(
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "Server Error",
                    detail: "An unexpected error occurred");
            }
        }

        [HttpGet("available")]
        [ProducesResponseType(typeof(IEnumerable<MazeDefinition>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<MazeDefinition>>> GetAvailableMazesAsync(
            CancellationToken cancellationToken)
        {
            try
            {
                var mazes = await _mazeService.GetAvailableMazesAsync(cancellationToken);
                return Ok(mazes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve available mazes");
                return Problem(
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "Server Error",
                    detail: "An unexpected error occurred");
            }
        }

        [HttpPost("initialize/{mazeId}")]
        [ProducesResponseType(typeof(GameState), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<GameState>> InitializeMazeAsync(
            string mazeId,
            CancellationToken cancellationToken)
        {
            try
            {
                var gameState = await _mazeService.InitializeMazeAsync(mazeId, cancellationToken);
                return Ok(gameState);
            }
            catch (KeyNotFoundException)
            {
                return Problem(
                    statusCode: StatusCodes.Status404NotFound,
                    title: "Not Found",
                    detail: $"Maze not found: {mazeId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize maze {mazeId}", mazeId);
                return Problem(
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "Server Error",
                    detail: "An unexpected error occurred");
            }
        }

        [HttpPost("move/{sessionId}")]
        [ProducesResponseType(typeof(GameState), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<GameState>> MakeMoveAsync(
            string sessionId,
            [FromBody] Direction direction,
            CancellationToken cancellationToken)
        {
            try
            {
                var gameState = await _mazeService.MakeNextMoveAsync(sessionId, direction, cancellationToken);
                return Ok(gameState);
            }
            catch (KeyNotFoundException)
            {
                return Problem(
                    statusCode: StatusCodes.Status404NotFound,
                    title: "Not Found",
                    detail: $"Game session not found: {sessionId}");
            }
            catch (InvalidOperationException ex)
            {
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Invalid Move",
                    detail: ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to make move for session {sessionId}", sessionId);
                return Problem(
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "Server Error",
                    detail: "An unexpected error occurred");
            }
        }

        [HttpDelete("clear")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ClearMazesAsync(CancellationToken cancellationToken)
        {
            try
            {
                await _mazeService.ClearMazesAsync(cancellationToken);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to clear mazes");
                return Problem(
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "Server Error",
                    detail: "An unexpected error occurred");
            }
        }

        [HttpGet("directions")]
        [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status200OK)]
        public ActionResult<IEnumerable<string>> GetDirections()
        {
            return Ok(Enum.GetNames(typeof(Direction)));
        }
    }
}
