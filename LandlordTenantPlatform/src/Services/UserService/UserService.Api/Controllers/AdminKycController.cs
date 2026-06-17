using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BuildingBlocks.Auth;
using UserService.Application.Commands.ApproveKyc;
using UserService.Application.Commands.RejectKyc;
using UserService.Application.Queries.GetPendingKyc;

namespace UserService.Api.Controllers;

[ApiController]
[Route("admin/kyc")]
[Authorize(Policy = AuthPolicies.AdminOnly)]
public class AdminKycController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminKycController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPending()
    {
        var query = new GetPendingKycQuery();
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
