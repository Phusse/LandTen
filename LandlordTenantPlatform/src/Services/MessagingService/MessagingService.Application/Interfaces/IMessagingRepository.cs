using MessagingService.Domain.Entities;
using BuildingBlocks.Common.Wrappers;

namespace MessagingService.Application.Interfaces;

/// <summary>
/// Data access interface for MessagingService.
/// Implementations live in MessagingService.Infrastructure.
/// </summary>
public interface IMessagingRepository
{
    // ── Conversations ─────────────────────────────────────────────────────────
    Task<Conversation?> GetConversationAsync(Guid id, CancellationToken ct);
    Task<Guid?> FindConversationIdAsync(Guid user1Id, Guid user2Id, Guid? propertyId, CancellationToken ct);
    Task AddConversationAsync(Conversation conversation, CancellationToken ct);

    Task<PagedResult<ConversationSummaryProjection>> GetMyConversationsAsync(
        Guid callerId, int page, int pageSize, CancellationToken ct);

    // ── Messages ──────────────────────────────────────────────────────────────
    Task<Message?> GetMessageAsync(Guid id, CancellationToken ct);
    Task AddMessageAsync(Message message, CancellationToken ct);
    Task<int> CountMessagesAsync(Guid conversationId, CancellationToken ct);

    Task<List<MessageProjection>> GetMessagesPageAsync(
        Guid conversationId, int skipFromStart, int take, CancellationToken ct);

    Task MarkReceivedMessagesReadAsync(Guid conversationId, Guid callerId, CancellationToken ct);
    Task<int> GetUnreadCountAsync(Guid callerId, CancellationToken ct);

    Task SaveChangesAsync(CancellationToken ct);
}

// ── Read-model projections returned by the repository ─────────────────────────

public record ConversationSummaryProjection(
    Guid Id,
    Guid User1Id,
    Guid User2Id,
    Guid? PropertyId,
    string? LastMessageContent,
    DateTime? LastMessageCreatedAt,
    bool? LastMessageIsRead,
    DateTime CreatedAt);

public record MessageProjection(
    Guid Id,
    Guid SenderId,
    string Content,
    DateTime CreatedAt,
    bool IsRead,
    bool IsDeleted,
    DateTime? EditedAt,
    string? AttachmentUrl,
    string? AttachmentType);
