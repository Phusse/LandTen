using MediatR;
using BuildingBlocks.Common.Wrappers;
using MessagingService.Application.Interfaces;

namespace MessagingService.Application.Queries.GetMyConversations;

public record GetMyConversationsQuery(Guid CallerId, int Page, int PageSize)
    : IRequest<Result<PagedResult<ConversationSummaryDto>>>;

public record MessagePreviewDto(string Content, DateTime CreatedAt, bool IsRead);

public record ConversationSummaryDto(
    Guid ConversationId,
    Guid? PropertyId,
    Guid OtherUserId,
    MessagePreviewDto? LastMessage);

public class GetMyConversationsQueryHandler
    : IRequestHandler<GetMyConversationsQuery, Result<PagedResult<ConversationSummaryDto>>>
{
    private readonly IMessagingRepository _repo;

    public GetMyConversationsQueryHandler(IMessagingRepository repo)
        => _repo = repo;

    public async Task<Result<PagedResult<ConversationSummaryDto>>> Handle(
        GetMyConversationsQuery request,
        CancellationToken cancellationToken)
    {
        var raw = await _repo.GetMyConversationsAsync(
            request.CallerId, request.Page, request.PageSize, cancellationToken);

        var items = raw.Items.Select(r => new ConversationSummaryDto(
            ConversationId: r.Id,
            PropertyId: r.PropertyId,
            OtherUserId: r.User1Id == request.CallerId ? r.User2Id : r.User1Id,
            LastMessage: r.LastMessageContent is null ? null : new MessagePreviewDto(
                Content: r.LastMessageContent.Length > 80
                    ? r.LastMessageContent[..80] + "…"
                    : r.LastMessageContent,
                CreatedAt: r.LastMessageCreatedAt!.Value,
                IsRead: r.LastMessageIsRead!.Value)
        )).ToList();

        return Result<PagedResult<ConversationSummaryDto>>.Success(
            PagedResult<ConversationSummaryDto>.Create(items, raw.TotalCount, request.Page, request.PageSize));
    }
}
