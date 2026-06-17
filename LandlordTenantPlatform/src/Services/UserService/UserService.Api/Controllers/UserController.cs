using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UserService.Application.Commands.ChangePassword;
using UserService.Application.Queries.GetUserById;
using UserService.Application.Queries.GetMyProfile;
using UserService.Application.Commands.UpdateMyProfile;
using UserService.Application.Queries.GetPublicLandlordProfile;

namespace UserService.Api.Controllers;

[ApiController]
[Route("users")]
public class UserController : ControllerBase
{
    private readonly IMediator _mediator;

    public UserController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous] // Depending on security, maybe require auth, but for internal service calls it might be easier or we secure it differently. We will allow anonymous for now to keep it simple.
    public async Task<IActionResult> GetById(Guid id)
    {
        var query = new GetUserByIdQuery(id);
        var result = await _mediator.Send(query);

        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }
        return NotFound(result.Error);
    }

    [HttpPatch("me/password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var command = new ChangePasswordCommand(userId, request.CurrentPassword, request.NewPassword);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return Ok();
        }
        return BadRequest(result.Error);
    }

    [HttpPost("me/avatar")]
    [Authorize]
    public async Task<IActionResult> UploadAvatar([FromForm] IFormFile file)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (file == null || file.Length == 0)
            return BadRequest("File is required.");

        try
        {
            using var stream = file.OpenReadStream();
            var command = new UserService.Application.Commands.UploadAvatar.UploadAvatarCommand(userId, stream, file.FileName);
            var result = await _mediator.Send(command);

            if (result.IsSuccess)
            {
                return Ok(new { Url = result.Value });
            }
            return BadRequest(result.Error);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Upload failed: {ex.Message}");
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var query = new GetMyProfileQuery(userId);
        var result = await _mediator.Send(query);

        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }
        return NotFound(result.Error);
    }

    [HttpPatch("me")]
    [Authorize]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateMyProfileRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var command = new UpdateMyProfileCommand(userId, request.FirstName, request.LastName);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return Ok();
        }
        return BadRequest(result.Error);
    }

    [HttpGet("{id:guid}/public-profile")]
    [Authorize]
    public async Task<IActionResult> GetPublicLandlordProfile(Guid id)
    {
        var query = new GetPublicLandlordProfileQuery(id);
        var result = await _mediator.Send(query);

        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }
        return NotFound(result.Error);
    }
}

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
public record UpdateMyProfileRequest(string FirstName, string LastName);
