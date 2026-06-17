using BuildingBlocks.EventBus.Events;

namespace MessagingService.Domain.Events;

/// <summary>Published to RabbitMQ when a new direct message is sent.</summary>
public sealed record MessageSentEvent(
    Guid MessageId,
    Guid SenderId,
    Guid RecipientId) : IntegrationEvent;
