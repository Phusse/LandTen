using BuildingBlocks.Common.Abstractions;

namespace MessagingService.Domain.Entities;

/// <summary>
/// A single message within a Conversation. Max 2000 chars.
/// IsRead is set to true when the recipient fetches the conversation messages.
/// </summary>
public sealed class Message : BaseEntity
{
    public Guid ConversationId { get; private set; }
    public Guid SenderId { get; private set; }
    public string Content { get; private set; } = string.Empty;
    public bool IsRead { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTime? EditedAt { get; private set; }
    public string? AttachmentUrl { get; private set; }
    public string? AttachmentType { get; private set; }

    // Navigation property
    public Conversation Conversation { get; private set; } = null!;

    private Message() { } // EF Core ctor

    public static Message Create(Guid conversationId, Guid senderId, string content, string? attachmentUrl = null, string? attachmentType = null)
    {
        return new Message
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            SenderId = senderId,
            Content = content,
            AttachmentUrl = attachmentUrl,
            AttachmentType = attachmentType,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
        };
    }

    public void MarkAsRead() => IsRead = true;

    public void Edit(string newContent)
    {
        Content = newContent;
        EditedAt = DateTime.UtcNow;
    }

    public void Delete()
    {
        IsDeleted = true;
        Content = string.Empty;
        AttachmentUrl = null;
        AttachmentType = null;
    }

    public void Attach(string url, string type)
    {
        AttachmentUrl = url;
        AttachmentType = type;
    }
}
