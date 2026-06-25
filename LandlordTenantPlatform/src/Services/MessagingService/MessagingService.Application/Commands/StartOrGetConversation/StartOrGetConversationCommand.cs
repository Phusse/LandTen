using MediatR;
using BuildingBlocks.Common.Wrappers;
using MessagingService.Application.Interfaces;
using MessagingService.Domain.Entities;

namespace MessagingService.Application.Commands.StartOrGetConversation;

public record StartOrGetConversationCommand(
    Guid CallerId,
    Guid OtherUserId,
    Guid? PropertyId) : IRequest<Result<Guid>>;

public class StartOrGetConversationCommandHandler
    : IRequestHandler<StartOrGetConversationCommand, Result<Guid>>
{
    private readonly IMessagingRepository _repo;

    public StartOrGetConversationCommandHandler(IMessagingRepository repo)
        => _repo = repo;

    public async Task<Result<Guid>> Handle(
        StartOrGetConversationCommand request,
        CancellationToken cancellationToken)
    {
        var (user1, user2) = Conversation.NormalizeUserIds(request.CallerId, request.OtherUserId);

        var existingId = await _repo.FindConversationIdAsync(user1, user2, request.PropertyId, cancellationToken);
        if (existingId.HasValue)
            return Result<Guid>.Success(existingId.Value);

        var conversation = Conversation.Create(request.CallerId, request.OtherUserId, request.PropertyId);
        await _repo.AddConversationAsync(conversation, cancellationToken);
        await _repo.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(conversation.Id);
    }
}
