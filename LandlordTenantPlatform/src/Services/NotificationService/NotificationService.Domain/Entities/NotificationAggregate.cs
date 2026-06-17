using BuildingBlocks.Common.Abstractions;

namespace NotificationService.Domain.Entities;

/// <summary>
/// Represents an outbound notification (email / SMS / push) queued for delivery.
/// Delivery logic is handled by the background worker in NotificationService.Api.
/// </summary>
public sealed class NotificationAggregate : BaseEntity
{
    public Guid RecipientId { get; private set; }
    public string Channel { get; private set; } = string.Empty; // "Email" | "SMS" | "Push"
    public string Subject { get; private set; } = string.Empty;
    public string Body { get; private set; } = string.Empty;
    public bool IsSent { get; private set; }

    private NotificationAggregate() { } // EF Core ctor

    public static NotificationAggregate Create(
        Guid recipientId, string channel, string subject, string body)
    {
        return new NotificationAggregate
        {
            Id = Guid.NewGuid(),
            RecipientId = recipientId,
            Channel = channel,
            Subject = subject,
            Body = body,
            IsSent = false,
            CreatedAt = DateTime.UtcNow
        };
    }
}
