using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BuildingBlocks.Auth;
using PropertyService.Application.Commands.ApprovePropertyVerification;
using PropertyService.Application.Commands.RejectPropertyVerification;
using PropertyService.Application.Queries.GetPendingPropertyVerifications;

namespace PropertyService.Api.Controllers;

[ApiController]
[Route("admin/properties")]
[Authorize(Policy = AuthPolicies.AdminOnly)]
public class AdminPropertyController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminPropertyController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("pending-verification")]
    public async Task<IActionResult> GetPendingVerifications()
    {
        var query = new GetPendingPropertyVerificationsQuery();
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
