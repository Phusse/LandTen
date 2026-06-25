using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BuildingBlocks.Auth;
using BuildingBlocks.Common.Interfaces;
using UserService.Application.Commands.ApproveKyc;
using UserService.Application.Commands.RejectKyc;
using UserService.Application.Queries.GetAllKyc;

namespace UserService.Api.Controllers;

[ApiController]
[Route("admin/kyc")]
[Authorize(Policy = AuthPolicies.AdminOnly)]
public class AdminKycController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IMediaStorageService _mediaStorage;

    public AdminKycController(IMediator mediator, IMediaStorageService mediaStorage)
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
        var query = new GetAllKycQuery(status);
        var result = await _mediator.Send(query);

        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }
        return BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var reviewerIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(reviewerIdString, out var reviewerId))
        {
            return Unauthorized();
        }

        var command = new ApproveKycCommand(id, reviewerId);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }
        return BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id)
    {
        var reviewerIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(reviewerIdString, out var reviewerId))
        {
            return Unauthorized();
        }

        var command = new RejectKycCommand(id, reviewerId);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }
        return BadRequest(result.Error);
    }
}
