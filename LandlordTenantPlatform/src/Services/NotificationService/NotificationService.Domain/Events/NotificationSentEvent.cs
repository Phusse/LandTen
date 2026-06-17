using BuildingBlocks.EventBus.Events;

namespace NotificationService.Domain.Events;

/// <summary>Published internally when a notification has been successfully dispatched.</summary>
public sealed record NotificationSentEvent(
    Guid NotificationId,
    Guid RecipientId,
    string Channel) : IntegrationEvent;
