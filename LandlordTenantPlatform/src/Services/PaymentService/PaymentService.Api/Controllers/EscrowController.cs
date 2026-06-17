using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaymentService.Application.Commands;
using System.Security.Claims;

namespace PaymentService.Api.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class EscrowController : ControllerBase
{
    private readonly IMediator _mediator;

    public EscrowController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("{id}/release")]
    [Authorize(Roles = "Landlord,Admin")]
    public async Task<IActionResult> ReleaseEscrow(Guid id)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var isAdmin = User.IsInRole("Admin");

        var result = await _mediator.Send(new ReleaseEscrowCommand(id, userId, isAdmin));
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpPost("{id}/refund")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RefundEscrow(Guid id)
    {
        var isAdmin = User.IsInRole("Admin");
        var result = await _mediator.Send(new RefundEscrowCommand(id, isAdmin));
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(result.Value);
    }
}
