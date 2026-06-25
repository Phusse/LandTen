using Microsoft.EntityFrameworkCore;
using BuildingBlocks.Common.Wrappers;
using MessagingService.Application.Interfaces;
using MessagingService.Domain.Entities;
using MessagingService.Infrastructure.Persistence;

namespace MessagingService.Infrastructure.Repositories;

public class MessagingRepository : IMessagingRepository
{
    private readonly MessagingDbContext _db;

    public MessagingRepository(MessagingDbContext db)
    {
        _db = db;
    }

    public async Task<Conversation?> GetConversationAsync(Guid id, CancellationToken ct)
    {
        return await _db.Conversations.FindAsync([id], ct);
    }

    public async Task<Guid?> FindConversationIdAsync(Guid user1Id, Guid user2Id, Guid? propertyId, CancellationToken ct)
    {
        var existing = await _db.Conversations
            .Where(c => c.User1Id == user1Id && c.User2Id == user2Id && c.PropertyId == propertyId)
            .Select(c => c.Id)
            .FirstOrDefaultAsync(ct);

        return existing != Guid.Empty ? existing : null;
    }

    public Task AddConversationAsync(Conversation conversation, CancellationToken ct)
    {
        _db.Conversations.Add(conversation);
        return Task.CompletedTask;
    }

    public async Task<PagedResult<ConversationSummaryProjection>> GetMyConversationsAsync(
        Guid callerId, int page, int pageSize, CancellationToken ct)
    {
        var query = _db.Conversations
            .Where(c => (c.User1Id == callerId && !c.User1Deleted) || (c.User2Id == callerId && !c.User2Deleted))
            .Select(c => new
            {
                c.Id,
                c.User1Id,
                c.User2Id,
                c.PropertyId,
                c.CreatedAt,
                LastMessage = c.Messages
                    .OrderByDescending(m => m.CreatedAt)
                    .Select(m => new { m.Content, m.CreatedAt, m.IsRead })
                    .FirstOrDefault()
            })
            .OrderByDescending(c => c.LastMessage != null ? c.LastMessage.CreatedAt : c.CreatedAt)
            .AsQueryable();

        var totalCount = await query.CountAsync(ct);

        var rows = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = rows.Select(r => new ConversationSummaryProjection(
            Id: r.Id,
            User1Id: r.User1Id,
            User2Id: r.User2Id,
            PropertyId: r.PropertyId,
            LastMessageContent: r.LastMessage?.Content,
            LastMessageCreatedAt: r.LastMessage?.CreatedAt,
            LastMessageIsRead: r.LastMessage?.IsRead,
            CreatedAt: r.CreatedAt
        )).ToList();

        return PagedResult<ConversationSummaryProjection>.Create(items, totalCount, page, pageSize);
    }

    public async Task<Message?> GetMessageAsync(Guid id, CancellationToken ct)
    {
        return await _db.Messages.FirstOrDefaultAsync(m => m.Id == id, ct);
    }

    public Task AddMessageAsync(Message message, CancellationToken ct)
    {
        _db.Messages.Add(message);
        return Task.CompletedTask;
    }

    public async Task<int> CountMessagesAsync(Guid conversationId, CancellationToken ct)
    {
        return await _db.Messages.CountAsync(m => m.ConversationId == conversationId, ct);
    }

    public async Task<List<MessageProjection>> GetMessagesPageAsync(
        Guid conversationId, int skipFromStart, int take, CancellationToken ct)
    {
        return await _db.Messages
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.CreatedAt)
            .Skip(skipFromStart)
            .Take(take)
            .Select(m => new MessageProjection(m.Id, m.SenderId, m.Content, m.CreatedAt, m.IsRead, m.IsDeleted, m.EditedAt, m.AttachmentUrl, m.AttachmentType))
            .ToListAsync(ct);
    }

    public async Task MarkReceivedMessagesReadAsync(Guid conversationId, Guid callerId, CancellationToken ct)
    {
        var unreadMessages = await _db.Messages
            .Where(m => m.ConversationId == conversationId
                     && m.SenderId != callerId
                     && !m.IsRead)
            .ToListAsync(ct);

        foreach (var msg in unreadMessages)
        {
            msg.MarkAsRead();
        }
    }

    public async Task<int> GetUnreadCountAsync(Guid callerId, CancellationToken ct)
    {
        return await _db.Messages
            .Where(m =>
                !m.IsRead &&
                m.SenderId != callerId &&
                _db.Conversations.Any(c =>
                    c.Id == m.ConversationId &&
                    (c.User1Id == callerId || c.User2Id == callerId)))
            .CountAsync(ct);
    }

    public async Task SaveChangesAsync(CancellationToken ct)
    {
        await _db.SaveChangesAsync(ct);
    }
}
