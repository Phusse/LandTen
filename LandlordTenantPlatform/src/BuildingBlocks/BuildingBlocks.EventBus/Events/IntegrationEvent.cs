namespace BuildingBlocks.EventBus.Events;

/// <summary>
/// Base record for all integration events published over RabbitMQ.
/// Every integration event carries a unique ID, the UTC time it occurred, and its type name.
/// </summary>
public abstract record IntegrationEvent
{
    public Guid EventId { get; init; } = Guid.NewGuid();
    public DateTime OccurredOn { get; init; } = DateTime.UtcNow;
    public string EventType => GetType().Name;
}
