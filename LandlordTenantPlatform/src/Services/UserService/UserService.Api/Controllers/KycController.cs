using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.Application.Commands.UploadKycDocument;

using UserService.Application.Queries.GetMyKycDocuments;

namespace UserService.Api.Controllers;

[ApiController]
[Route("kyc")]
[Authorize] // Any authenticated user
public class KycController : ControllerBase
{
    private readonly IMediator _mediator;

    public KycController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyDocuments()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var query = new GetMyKycDocumentsQuery(userId);
        var result = await _mediator.Send(query);

        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }
        return BadRequest(result.Error);
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadDocument([FromForm] IFormFile file, [FromForm] string documentType, [FromServices] BuildingBlocks.Common.Interfaces.IMediaStorageService mediaStorageService)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        if (file == null || file.Length == 0)
            return BadRequest("File is required.");

        try
        {
            using var stream = file.OpenReadStream();
            var fileUrl = await mediaStorageService.UploadImageAsync(stream, file.FileName);

            var command = new UploadKycDocumentCommand(userId, documentType, fileUrl);
            var result = await _mediator.Send(command);

            if (result.IsSuccess)
            {
                return Ok(new { Url = fileUrl });
            }
            return BadRequest(result.Error);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Upload failed: {ex.Message}");
        }
    }
}
