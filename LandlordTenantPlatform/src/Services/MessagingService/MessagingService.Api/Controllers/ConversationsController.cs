using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using MessagingService.Application.Commands.StartOrGetConversation;
using MessagingService.Application.Commands.SendMessage;
using MessagingService.Application.Queries.GetMyConversations;
using MessagingService.Application.Queries.GetMessages;
using MessagingService.Application.Queries.GetUnreadCount;
using BuildingBlocks.Auth;

namespace MessagingService.Api.Controllers;

[ApiController]
[Route("conversations")]
[Authorize]
public class ConversationsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly MessagingService.Application.Services.TypingStatusCache _typingCache;
    private readonly BuildingBlocks.Common.Interfaces.IMediaStorageService _mediaStorage;

    public ConversationsController(
        IMediator mediator,
        MessagingService.Application.Services.TypingStatusCache typingCache,
        BuildingBlocks.Common.Interfaces.IMediaStorageService mediaStorage)
    {
        _mediator = mediator;
        _typingCache = typingCache;
        _mediaStorage = mediaStorage;
    }

    private Guid GetCallerId()
        => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// POST /conversations
    /// Start or retrieve an existing conversation with another user,
    /// optionally scoped to a property listing.
    /// </summary>
    [HttpPost]
    [Authorize(Policy = AuthPolicies.VerifiedUserOnly)]
    public async Task<IActionResult> StartOrGetConversation(
        [FromBody] StartConversationRequest request,
        CancellationToken cancellationToken)
    {
        var command = new StartOrGetConversationCommand(
            CallerId: GetCallerId(),
            OtherUserId: request.OtherUserId,
            PropertyId: request.PropertyId);

        var result = await _mediator.Send(command, cancellationToken);
        if (result.IsSuccess)
            return Ok(new { conversationId = result.Value });

        return BadRequest(result.Error);
    }

    /// <summary>
    /// GET /conversations
    /// List all conversations the caller participates in, newest activity first.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetMyConversations(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = new GetMyConversationsQuery(GetCallerId(), page, pageSize);
        var result = await _mediator.Send(query, cancellationToken);
        if (result.IsSuccess) return Ok(result.Value);
        return BadRequest(result.Error);
    }

    /// <summary>
    /// GET /conversations/unread-count
    /// Returns the total unread message count for the nav badge.
    /// IMPORTANT: this route must be declared BEFORE {id}/messages to avoid route conflicts.
    /// </summary>
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken cancellationToken)
    {
        var query = new GetUnreadCountQuery(GetCallerId());
        var result = await _mediator.Send(query, cancellationToken);
        if (result.IsSuccess) return Ok(new { count = result.Value });
        return BadRequest(result.Error);
    }

    /// <summary>
    /// POST /conversations/{id}/messages
    /// Send a message in a conversation. Caller must be a participant.
    /// </summary>
    [HttpPost("{id:guid}/messages")]
    [Authorize(Policy = AuthPolicies.VerifiedUserOnly)]
    [Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("MessageSpamPolicy")]
    public async Task<IActionResult> SendMessage(
        Guid id,
        [FromBody] SendMessageRequest request,
        CancellationToken cancellationToken)
    {
        var command = new SendMessageCommand(
            CallerId: GetCallerId(),
            ConversationId: id,
            Content: request.Content,
            AttachmentUrl: request.AttachmentUrl,
            AttachmentType: request.AttachmentType);

        var result = await _mediator.Send(command, cancellationToken);
        if (result.IsSuccess)
            return Ok(new { messageId = result.Value!.MessageId, createdAt = result.Value.CreatedAt });

        return BadRequest(result.Error);
    }

    /// <summary>
    /// GET /conversations/{id}/messages
    /// Fetch paginated messages. Also marks received messages as read.
    /// </summary>
    [HttpGet("{id:guid}/messages")]
    public async Task<IActionResult> GetMessages(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = new GetMessagesQuery(
            CallerId: GetCallerId(),
            ConversationId: id,
            Page: page,
            PageSize: pageSize);

        var result = await _mediator.Send(query, cancellationToken);
        if (result.IsSuccess) return Ok(result.Value);
        return BadRequest(result.Error);
    }

    [HttpPatch("{id:guid}/messages/{msgId:guid}")]
    public async Task<IActionResult> EditMessage(
        Guid id, Guid msgId,
        [FromBody] EditMessageRequest request,
        CancellationToken cancellationToken)
    {
        var command = new MessagingService.Application.Commands.EditMessage.EditMessageCommand(
            GetCallerId(), id, msgId, request.NewContent);
        var result = await _mediator.Send(command, cancellationToken);
        return result.IsSuccess ? Ok() : BadRequest(result.Error);
    }

    [HttpDelete("{id:guid}/messages/{msgId:guid}")]
    public async Task<IActionResult> DeleteMessage(
        Guid id, Guid msgId, CancellationToken cancellationToken)
    {
        var command = new MessagingService.Application.Commands.DeleteMessage.DeleteMessageCommand(
            GetCallerId(), id, msgId);
        var result = await _mediator.Send(command, cancellationToken);
        return result.IsSuccess ? Ok() : BadRequest(result.Error);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteConversation(
        Guid id, CancellationToken cancellationToken)
    {
        var command = new MessagingService.Application.Commands.DeleteConversation.DeleteConversationCommand(
            GetCallerId(), id);
        var result = await _mediator.Send(command, cancellationToken);
        return result.IsSuccess ? Ok() : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/typing")]
    public IActionResult SetTypingStatus(Guid id)
    {
        _typingCache.SetTypingStatus(id, GetCallerId());
        return Ok();
    }

    [HttpGet("{id:guid}/typing")]
    public async Task<IActionResult> GetTypingStatus(
        Guid id, [FromServices] MessagingService.Application.Interfaces.IMessagingRepository repo, CancellationToken ct)
    {
        var conv = await repo.GetConversationAsync(id, ct);
        if (conv == null || !conv.IsParticipant(GetCallerId())) return Unauthorized();

        var otherId = conv.GetOtherParticipant(GetCallerId());
        var isTyping = _typingCache.IsUserTyping(id, otherId);
        return Ok(new { isTyping });
    }

    [HttpPost("{id:guid}/attachments")]
    public async Task<IActionResult> UploadAttachment(Guid id, IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("File is empty");
        
        if (file.Length > 5 * 1024 * 1024) return BadRequest("File size exceeds 5MB limit");

        var allowedContentTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        if (!allowedContentTypes.Contains(file.ContentType.ToLowerInvariant()))
            return BadRequest("Only JPG, PNG, WEBP, and GIF images are allowed.");

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
            return BadRequest("File extension is not an allowed image type.");

        // NOTE: True magic-byte detection (reading first bytes) would be a stronger future improvement.
        
        using var stream = file.OpenReadStream();
        var url = await _mediaStorage.UploadImageAsync(stream, file.FileName);
        if (string.IsNullOrEmpty(url)) return BadRequest("Upload failed");

        return Ok(new { url });
    }
}

// ── Request DTOs ──────────────────────────────────────────────────────────────
public record StartConversationRequest(Guid OtherUserId, Guid? PropertyId);
public record SendMessageRequest(string Content, string? AttachmentUrl = null, string? AttachmentType = null);
public record EditMessageRequest(string NewContent);
