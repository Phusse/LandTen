namespace BuildingBlocks.Common.Abstractions;

/// <summary>
/// Root base class for all domain aggregates and entities.
/// Provides a <see cref="Guid"/> identity and UTC audit timestamps.
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; protected set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; protected set; }

    protected void SetUpdatedAt() => UpdatedAt = DateTime.UtcNow;
}
