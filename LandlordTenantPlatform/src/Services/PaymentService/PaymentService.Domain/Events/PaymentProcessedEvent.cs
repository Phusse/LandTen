using BuildingBlocks.EventBus.Events;

namespace PaymentService.Domain.Events;

/// <summary>Published to RabbitMQ when a payment is successfully processed.</summary>
public sealed record PaymentProcessedEvent(
    Guid PaymentId,
    Guid TenantId,
    Guid PropertyId,
    decimal Amount,
    string Status) : IntegrationEvent;
