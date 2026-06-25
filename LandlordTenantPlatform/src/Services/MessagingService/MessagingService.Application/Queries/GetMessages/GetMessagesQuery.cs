using MediatR;
using BuildingBlocks.Common.Wrappers;
using BuildingBlocks.Common.Exceptions;
using MessagingService.Application.Interfaces;

namespace MessagingService.Application.Queries.GetMessages;

public record GetMessagesQuery(
    Guid CallerId,
    Guid ConversationId,
    int Page,
    int PageSize) : IRequest<Result<PagedResult<MessageDto>>>;

public record MessageDto(
    Guid MessageId,
    Guid SenderId,
    string Content,
    DateTime CreatedAt,
    bool IsRead,
    bool IsDeleted,
    DateTime? EditedAt,
    string? AttachmentUrl,
    string? AttachmentType);

public class GetMessagesQueryHandler
    : IRequestHandler<GetMessagesQuery, Result<PagedResult<MessageDto>>>
{
    private readonly IMessagingRepository _repo;

    public GetMessagesQueryHandler(IMessagingRepository repo)
        => _repo = repo;

    public async Task<Result<PagedResult<MessageDto>>> Handle(
        GetMessagesQuery request,
        CancellationToken cancellationToken)
    {
        var conversation = await _repo.GetConversationAsync(request.ConversationId, cancellationToken);

        if (conversation is null)
            throw new NotFoundException("Conversation", request.ConversationId);

        if (!conversation.IsParticipant(request.CallerId))
            throw new ForbiddenException("You are not a participant of this conversation.");

        await _repo.MarkReceivedMessagesReadAsync(request.ConversationId, request.CallerId, cancellationToken);
        await _repo.SaveChangesAsync(cancellationToken);

        var totalCount = await _repo.CountMessagesAsync(request.ConversationId, cancellationToken);

        var skipFromEnd = (request.Page - 1) * request.PageSize;
        var skipFromStart = Math.Max(0, totalCount - skipFromEnd - request.PageSize);
        var take = Math.Min(request.PageSize, totalCount - skipFromEnd);

        if (take <= 0)
        {
             return Result<PagedResult<MessageDto>>.Success(
                PagedResult<MessageDto>.Create([], totalCount, request.Page, request.PageSize));
        }

        var messages = await _repo.GetMessagesPageAsync(request.ConversationId, skipFromStart, take, cancellationToken);

        var dtos = messages.Select(m => new MessageDto(
            m.Id, m.SenderId, m.Content, m.CreatedAt, m.IsRead,
            m.IsDeleted, m.EditedAt, m.AttachmentUrl, m.AttachmentType)).ToList();

        return Result<PagedResult<MessageDto>>.Success(
            PagedResult<MessageDto>.Create(dtos, totalCount, request.Page, request.PageSize));
    }
}
