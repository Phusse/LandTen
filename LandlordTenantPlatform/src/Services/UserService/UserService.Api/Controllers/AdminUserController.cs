using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BuildingBlocks.Auth;
using UserService.Application.Commands.Admin.SuspendUser;
using UserService.Application.Commands.Admin.ReactivateUser;
using UserService.Application.Queries.Admin.GetUsers;

namespace UserService.Api.Controllers;

[ApiController]
[Route("admin/users")]
[Authorize(Policy = AuthPolicies.AdminOnly)]
public class AdminUserController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminUserController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null)
    {
        var query = new GetUsersQuery(pageNumber, pageSize, search);
        var result = await _mediator.Send(query);

        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }
        return BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/suspend")]
    public async Task<IActionResult> SuspendUser(Guid id, [FromBody] AdminActionRequest request)
    {
        var adminIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(adminIdString, out var adminId))
            return Unauthorized();

        var command = new SuspendUserCommand(id, adminId, request.Reason);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return Ok();
        }
        return BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/reactivate")]
    public async Task<IActionResult> ReactivateUser(Guid id, [FromBody] AdminActionRequest request)
    {
        var adminIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(adminIdString, out var adminId))
            return Unauthorized();

        var command = new ReactivateUserCommand(id, adminId, request.Reason);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return Ok();
        }
        return BadRequest(result.Error);
    }
}

public record AdminActionRequest(string? Reason);
