using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BuildingBlocks.Auth;
using BuildingBlocks.Common.Interfaces;
using PropertyService.Application.Commands.ApprovePropertyVerification;
using PropertyService.Application.Commands.RejectPropertyVerification;
using PropertyService.Application.Queries.GetAllPropertyVerifications;

namespace PropertyService.Api.Controllers;

[ApiController]
[Route("admin/properties")]
[Authorize(Policy = AuthPolicies.AdminOnly)]
public class AdminPropertyController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IMediaStorageService _mediaStorage;

    public AdminPropertyController(IMediator mediator, IMediaStorageService mediaStorage)
    {
        _mediator = mediator;
        _mediaStorage = mediaStorage;
    }

    /// <summary>Returns a signed Cloudinary URL for documents that were stored as private.</summary>
    [HttpGet("signed-url")]
    public IActionResult GetSignedUrl([FromQuery] string url)
    {
        if (string.IsNullOrWhiteSpace(url)) return BadRequest("url is required");
        var signed = _mediaStorage.GetSignedUrl(url);
        return Ok(new { signedUrl = signed });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        var query = new GetAllPropertyVerificationsQuery(status);
        var result = await _mediator.Send(query);

        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }
        return BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/verify")]
    public async Task<IActionResult> VerifyDocument(Guid id)
    {
        var reviewerIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(reviewerIdString, out var reviewerId))
        {
            return Unauthorized();
        }

        var command = new ApprovePropertyVerificationCommand(id, reviewerId);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }
        return BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> RejectDocument(Guid id)
    {
        var reviewerIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(reviewerIdString, out var reviewerId))
        {
            return Unauthorized();
        }

        var command = new RejectPropertyVerificationCommand(id, reviewerId);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }
        return BadRequest(result.Error);
    }
}
