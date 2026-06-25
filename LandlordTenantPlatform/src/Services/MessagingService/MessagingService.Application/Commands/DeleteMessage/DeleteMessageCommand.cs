using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using MediatR;
using MessagingService.Application.Interfaces;

namespace MessagingService.Application.Commands.DeleteMessage;

public record DeleteMessageCommand(
    Guid CallerId,
    Guid ConversationId,
    Guid MessageId) : IRequest<Result<Unit>>;

public class DeleteMessageCommandHandler : IRequestHandler<DeleteMessageCommand, Result<Unit>>
{
    private readonly IMessagingRepository _repo;

    public DeleteMessageCommandHandler(IMessagingRepository repo)
    {
        _repo = repo;
    }

    public async Task<Result<Unit>> Handle(DeleteMessageCommand request, CancellationToken cancellationToken)
    {
        var conversation = await _repo.GetConversationAsync(request.ConversationId, cancellationToken);
        if (conversation is null)
            throw new NotFoundException("Conversation", request.ConversationId);

        if (!conversation.IsParticipant(request.CallerId))
            throw new ForbiddenException("You are not a participant of this conversation.");

        var message = await _repo.GetMessageAsync(request.MessageId, cancellationToken);
        if (message is null || message.ConversationId != request.ConversationId)
            throw new NotFoundException("Message", request.MessageId);

        if (message.SenderId != request.CallerId)
            throw new ForbiddenException("You can only delete your own messages.");

        if (message.IsDeleted)
            return Result<Unit>.Success(Unit.Value);

        message.Delete();

        await _repo.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
