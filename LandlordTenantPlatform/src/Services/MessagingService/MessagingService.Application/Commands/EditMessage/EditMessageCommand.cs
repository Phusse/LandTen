using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using FluentValidation;
using MediatR;
using MessagingService.Application.Interfaces;

namespace MessagingService.Application.Commands.EditMessage;

public record EditMessageCommand(
    Guid CallerId,
    Guid ConversationId,
    Guid MessageId,
    string NewContent) : IRequest<Result<Unit>>;

public class EditMessageCommandValidator : AbstractValidator<EditMessageCommand>
{
    public EditMessageCommandValidator()
    {
        RuleFor(x => x.NewContent).NotEmpty().MaximumLength(2000);
    }
}

public class EditMessageCommandHandler : IRequestHandler<EditMessageCommand, Result<Unit>>
{
    private readonly IMessagingRepository _repo;

    public EditMessageCommandHandler(IMessagingRepository repo)
    {
        _repo = repo;
    }

    public async Task<Result<Unit>> Handle(EditMessageCommand request, CancellationToken cancellationToken)
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
            throw new ForbiddenException("You can only edit your own messages.");

        if (message.IsDeleted)
            return Result<Unit>.Failure("Cannot edit a deleted message.");

        message.Edit(request.NewContent);

        await _repo.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
