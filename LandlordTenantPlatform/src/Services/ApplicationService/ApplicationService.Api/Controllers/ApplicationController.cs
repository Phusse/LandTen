using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using BuildingBlocks.Auth;
using ApplicationService.Application.Commands.ApplyToProperty;
using ApplicationService.Application.Commands.UpdateApplicationStatus;
using ApplicationService.Application.Commands.ScheduleInspection;
using ApplicationService.Application.Queries.GetMyApplications;
using ApplicationService.Domain.Enums;

namespace ApplicationService.Api.Controllers;

[ApiController]
[Route("applications")]
[Authorize]
public class ApplicationController : ControllerBase
{
    private readonly IMediator _mediator;

    public ApplicationController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string GetUserRole() => User.FindFirstValue("role") ?? User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

    [HttpPost]
    [Authorize(Policy = AuthPolicies.VerifiedTenantOnly)]
    public async Task<IActionResult> ApplyToProperty([FromBody] ApplyRequest request, CancellationToken cancellationToken)
    {
        var command = new ApplyToPropertyCommand(request.PropertyId, GetUserId());
        var result = await _mediator.Send(command, cancellationToken);
        if (result.IsSuccess) return Ok(result.Value);
        return BadRequest(result.Error);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyApplications(CancellationToken cancellationToken)
    {
        var query = new GetMyApplicationsQuery(GetUserId(), GetUserRole());
        var result = await _mediator.Send(query, cancellationToken);
        if (result.IsSuccess) return Ok(result.Value);
        return BadRequest(result.Error);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Policy = AuthPolicies.LandlordOnly)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest request, CancellationToken cancellationToken)
    {
        var command = new UpdateApplicationStatusCommand(id, request.Status, GetUserId());
        var result = await _mediator.Send(command, cancellationToken);
        if (result.IsSuccess) return Ok();
        return BadRequest(result.Error);
    }

    [HttpPost("{id}/inspection")]
    public async Task<IActionResult> ScheduleInspection(Guid id, [FromBody] ScheduleInspectionRequest request, CancellationToken cancellationToken)
    {
        var command = new ScheduleInspectionCommand(id, request.InspectionDate, GetUserId(), GetUserRole());
        var result = await _mediator.Send(command, cancellationToken);
        if (result.IsSuccess) return Ok();
        return BadRequest(result.Error);
    }
}

public record ApplyRequest(Guid PropertyId);
public record UpdateStatusRequest(ApplicationStatus Status);
public record ScheduleInspectionRequest(DateTime InspectionDate);
