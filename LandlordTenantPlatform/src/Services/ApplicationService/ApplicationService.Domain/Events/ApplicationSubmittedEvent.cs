using BuildingBlocks.EventBus.Events;

namespace ApplicationService.Domain.Events;

/// <summary>Published to RabbitMQ when a rental application is submitted.</summary>
public sealed record ApplicationSubmittedEvent(
    Guid ApplicationId,
    Guid PropertyId,
    Guid TenantId) : IntegrationEvent;
