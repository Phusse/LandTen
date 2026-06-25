using MediatR;
using BuildingBlocks.Common.Wrappers;
using BuildingBlocks.Common.Exceptions;
using MessagingService.Application.Interfaces;
using MessagingService.Domain.Entities;

namespace MessagingService.Application.Commands.SendMessage;

public record SendMessageCommand(
    Guid CallerId,
    Guid ConversationId,
    string Content,
    string? AttachmentUrl = null,
    string? AttachmentType = null) : IRequest<Result<SendMessageResponse>>;

public record SendMessageResponse(Guid MessageId, DateTime CreatedAt);

public class SendMessageCommandHandler
    : IRequestHandler<SendMessageCommand, Result<SendMessageResponse>>
{
    private readonly IMessagingRepository _repo;

    public SendMessageCommandHandler(IMessagingRepository repo)
        => _repo = repo;

    public async Task<Result<SendMessageResponse>> Handle(
        SendMessageCommand request,
        CancellationToken cancellationToken)
    {
        var trimmedContent = request.Content?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(trimmedContent) && string.IsNullOrWhiteSpace(request.AttachmentUrl))
            return Result<SendMessageResponse>.Failure("Message content or attachment must be provided.");

        if (trimmedContent.Length > 2000)
            return Result<SendMessageResponse>.Failure("Message content cannot exceed 2000 characters.");
            
        // Note: Suspended users are locked out within the 15-minute token expiry window.
        // This acts as a known and acceptable pseudo-real-time suspension mechanism.

        var conversation = await _repo.GetConversationAsync(request.ConversationId, cancellationToken);

        if (conversation is null)
            throw new NotFoundException("Conversation", request.ConversationId);

        if (!conversation.IsParticipant(request.CallerId))
            throw new ForbiddenException("You are not a participant of this conversation.");

        var message = Message.Create(request.ConversationId, request.CallerId, trimmedContent, request.AttachmentUrl, request.AttachmentType);
        await _repo.AddMessageAsync(message, cancellationToken);
        await _repo.SaveChangesAsync(cancellationToken);

        return Result<SendMessageResponse>.Success(new SendMessageResponse(message.Id, message.CreatedAt));
    }
}
