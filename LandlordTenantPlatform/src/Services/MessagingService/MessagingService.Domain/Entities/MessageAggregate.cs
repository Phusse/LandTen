using BuildingBlocks.Common.Abstractions;

namespace MessagingService.Domain.Entities;

/// <summary>
/// Root aggregate representing a direct message between a landlord and tenant.
/// Threading and read-receipts added in the next sprint.
/// </summary>
public sealed class MessageAggregate : BaseEntity
{
    public Guid SenderId { get; private set; }
    public Guid RecipientId { get; private set; }
    public string Content { get; private set; } = string.Empty;
    public bool IsRead { get; private set; }

    private MessageAggregate() { } // EF Core ctor

    public static MessageAggregate Create(Guid senderId, Guid recipientId, string content)
    {
        return new MessageAggregate
        {
            Id = Guid.NewGuid(),
            SenderId = senderId,
            RecipientId = recipientId,
            Content = content,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
    }
}
