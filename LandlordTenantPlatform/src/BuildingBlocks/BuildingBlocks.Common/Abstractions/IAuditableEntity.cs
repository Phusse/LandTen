namespace BuildingBlocks.Common.Abstractions;

/// <summary>
/// Marks an entity as fully auditable (created/updated by user).
/// </summary>
public interface IAuditableEntity
{
    DateTime CreatedAt { get; }
    string? CreatedBy { get; }
    DateTime? UpdatedAt { get; }
    string? UpdatedBy { get; }
}
