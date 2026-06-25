using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using MediatR;
using MessagingService.Application.Interfaces;

namespace MessagingService.Application.Commands.DeleteConversation;

public record DeleteConversationCommand(
    Guid CallerId,
    Guid ConversationId) : IRequest<Result<Unit>>;

public class DeleteConversationCommandHandler : IRequestHandler<DeleteConversationCommand, Result<Unit>>
{
    private readonly IMessagingRepository _repo;

    public DeleteConversationCommandHandler(IMessagingRepository repo)
    {
        _repo = repo;
    }

    public async Task<Result<Unit>> Handle(DeleteConversationCommand request, CancellationToken cancellationToken)
    {
        var conversation = await _repo.GetConversationAsync(request.ConversationId, cancellationToken);
        if (conversation is null)
            throw new NotFoundException("Conversation", request.ConversationId);

        if (!conversation.IsParticipant(request.CallerId))
            throw new ForbiddenException("You are not a participant of this conversation.");

        conversation.SoftDelete(request.CallerId);

        await _repo.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
