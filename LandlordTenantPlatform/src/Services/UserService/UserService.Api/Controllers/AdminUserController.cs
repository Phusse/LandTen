using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BuildingBlocks.Auth;
using UserService.Application.Commands.Admin.SuspendUser;
using UserService.Application.Commands.Admin.ReactivateUser;
using UserService.Application.Commands.Admin.AssignRole;
using UserService.Application.Commands.Admin.DeleteUser;
using UserService.Application.Queries.Admin.GetUsers;
using UserService.Application.Commands.Admin.InviteAdmin;
using UserService.Application.Interfaces;
using UserService.Domain.Enums;

namespace UserService.Api.Controllers;

[ApiController]
[Route("admin/users")]
[Authorize(Policy = AuthPolicies.AdminOnly)]
public class AdminUserController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IAdminActionLogRepository _auditLog;

    public AdminUserController(IMediator mediator, IAdminActionLogRepository auditLog)
    {
        _mediator = mediator;
        _auditLog = auditLog;
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

    [HttpPost("{id:guid}/assign-role")]
    [Authorize(Policy = AuthPolicies.SuperAdminOnly)]
    public async Task<IActionResult> AssignRole(Guid id, [FromBody] AssignRoleRequest request)
    {
        var adminIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(adminIdString, out var adminId))
            return Unauthorized();

        var command = new AssignRoleCommand(id, adminId, request.Role);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return Ok();
        }
        return BadRequest(result.Error);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = AuthPolicies.SuperAdminOnly)]
    public async Task<IActionResult> DeleteUser(Guid id, [FromBody] AdminActionRequest request)
    {
        var adminIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(adminIdString, out var adminId))
            return Unauthorized();

        var command = new DeleteUserCommand(id, adminId, request.Reason);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return Ok();
        }
        return BadRequest(result.Error);
    }
    [HttpGet("audit")]
    public async Task<IActionResult> GetAuditLog([FromQuery] int pageSize = 100)
    {
        var logs = await _auditLog.GetAuditLogAsync(pageSize);
        var result = logs.Select(l => new
        {
            l.Id,
            l.Action,
            l.Reason,
            l.CreatedAt,
            TargetUserId = l.TargetUserId,
            TargetName = l.TargetUser?.UserProfile != null
                ? $"{l.TargetUser.UserProfile.FirstName} {l.TargetUser.UserProfile.LastName}".Trim()
                : l.TargetUser?.Email ?? "Unknown",
            TargetEmail = l.TargetUser?.Email ?? "Unknown",
            PerformedBy = l.PerformedBy,
        });
        return Ok(result);
    }

    [HttpPost("invite")]
    [Authorize(Policy = AuthPolicies.SuperAdminOnly)]
    public async Task<IActionResult> InviteAdmin([FromBody] InviteAdminRequest request)
    {
        var adminIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(adminIdString, out var adminId))
            return Unauthorized();

        var command = new InviteAdminCommand(request.Email, request.FirstName, request.LastName, request.TemporaryPassword, adminId);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return Ok(new { UserId = result.Value });
        }
        return BadRequest(result.Error);
    }
}

public record AdminActionRequest(string? Reason);
public record AssignRoleRequest(UserRole Role);
public record InviteAdminRequest(string Email, string FirstName, string LastName, string TemporaryPassword);
