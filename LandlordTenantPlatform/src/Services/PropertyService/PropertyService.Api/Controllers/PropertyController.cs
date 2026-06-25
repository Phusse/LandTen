using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BuildingBlocks.Auth;
using PropertyService.Application.Commands.CreateProperty;
using PropertyService.Application.Commands.UpdateProperty;
using PropertyService.Application.Commands.DeleteProperty;
using PropertyService.Application.Commands.UpdatePropertyStatus;
using PropertyService.Application.Commands.AddPropertyImage;
using PropertyService.Application.Queries.SearchProperties;
using PropertyService.Application.Queries.GetPropertyById;
using PropertyService.Application.Queries.GetPropertiesByLandlord;
using PropertyService.Application.Queries.GetPropertiesByLandlord;
using PropertyService.Domain.Enums;
using BuildingBlocks.Common.Interfaces;

namespace PropertyService.Api.Controllers;

[ApiController]
[Route("properties")]
public class PropertyController : ControllerBase
{
    private readonly IMediator _mediator;

    public PropertyController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize(Policy = AuthPolicies.VerifiedLandlordOnly)]
    public async Task<IActionResult> Create([FromBody] CreatePropertyRequest request)
    {
        var landlordIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(landlordIdString, out var landlordId))
            return Unauthorized();

        var command = new CreatePropertyCommand(
            landlordId,
            request.Title,
            request.Description,
            request.Address,
            request.City,
            request.State,
            request.RentPrice,
            request.Rooms,
            request.Bathrooms,
            request.PropertyType);

        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetById), new { id = result.Value!.PropertyId }, result.Value);
        }
        return BadRequest(result.Error);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePropertyRequest request)
    {
        var landlordIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(landlordIdString, out var landlordId))
            return Unauthorized();

        var command = new UpdatePropertyCommand(
            id,
            landlordId,
            request.Title,
            request.Description,
            request.Address,
            request.City,
            request.State,
            request.RentPrice,
            request.Rooms,
            request.Bathrooms,
            request.PropertyType);

        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return NoContent();
        }
        return BadRequest(result.Error);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        var landlordIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(landlordIdString, out var landlordId))
            return Unauthorized();

        var command = new DeletePropertyCommand(id, landlordId);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return NoContent();
        }
        return BadRequest(result.Error);
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdatePropertyStatusRequest request)
    {
        var landlordIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(landlordIdString, out var landlordId))
            return Unauthorized();

        if (!Enum.TryParse<PropertyStatus>(request.Status, true, out var parsedStatus))
            return BadRequest("Invalid status.");

        var command = new UpdatePropertyStatusCommand(id, landlordId, parsedStatus);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return NoContent();
        }
        return BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/images")]
    [Authorize]
    public async Task<IActionResult> AddImage(Guid id, [FromForm] IFormFile file, [FromServices] IMediaStorageService mediaStorageService)
    {
        var landlordIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(landlordIdString, out var landlordId))
            return Unauthorized();

        if (file == null || file.Length == 0)
            return BadRequest("File is required.");

        try
        {
            using var stream = file.OpenReadStream();
            var imageUrl = await mediaStorageService.UploadImageAsync(stream, file.FileName);

            var command = new AddPropertyImageCommand(id, landlordId, imageUrl);
            var result = await _mediator.Send(command);

            if (result.IsSuccess)
            {
                return Ok(new { Url = imageUrl });
            }
            return BadRequest(result.Error);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Upload failed: {ex.Message}");
        }
    }

    [HttpPost("{id:guid}/documents")]
    [Authorize]
    public async Task<IActionResult> AddDocument(Guid id, [FromForm] IFormFile file, [FromForm] string documentType, [FromServices] IMediaStorageService mediaStorageService)
    {
        var landlordIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(landlordIdString, out var landlordId))
            return Unauthorized();

        if (file == null || file.Length == 0)
            return BadRequest("File is required.");

        try
        {
            using var stream = file.OpenReadStream();
            var fileUrl = await mediaStorageService.UploadImageAsync(stream, file.FileName);

            var command = new PropertyService.Application.Commands.UploadPropertyDocument.UploadPropertyDocumentCommand(landlordId, id, documentType, fileUrl);
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

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Search([FromQuery] SearchPropertiesQuery query)
    {
        var result = await _mediator.Send(query);

        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }
        return BadRequest(result.Error);
    }

    [HttpGet("my")]
    [Authorize(Policy = AuthPolicies.LandlordOnly)]
    public async Task<IActionResult> GetMyProperties([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var landlordIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(landlordIdString, out var landlordId))
            return Unauthorized();

        var query = new GetPropertiesByLandlordQuery(landlordId, pageNumber, pageSize);
        var result = await _mediator.Send(query);

        if (result.IsSuccess) return Ok(result.Value);
        return BadRequest(result.Error);
    }

    [HttpGet("landlord/{landlordId}")]
    [Authorize]
    public async Task<IActionResult> GetPropertiesByLandlord(Guid landlordId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var callerIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(callerIdString, out var callerId) || callerId != landlordId)
            return Forbid();

        var query = new GetPropertiesByLandlordQuery(landlordId, pageNumber, pageSize);
        var result = await _mediator.Send(query);

        if (result.IsSuccess) return Ok(result.Value);
        return BadRequest(result.Error);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var query = new GetPropertyByIdQuery(id);
        var result = await _mediator.Send(query);

        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }
        return NotFound(result.Error);
    }
}

public record CreatePropertyRequest(string Title, string Description, string Address, string City, string State, decimal RentPrice, int Rooms, int Bathrooms, string PropertyType);
public record UpdatePropertyRequest(string Title, string Description, string Address, string City, string State, decimal RentPrice, int Rooms, int Bathrooms, string PropertyType);
public record UpdatePropertyStatusRequest(string Status);
public record AddPropertyImageRequest(string FileUrl);
