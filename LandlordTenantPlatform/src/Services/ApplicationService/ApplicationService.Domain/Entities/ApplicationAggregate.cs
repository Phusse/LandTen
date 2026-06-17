using BuildingBlocks.Common.Abstractions;

namespace ApplicationService.Domain.Entities;

/// <summary>
/// Root aggregate representing a tenant's rental application for a property.
/// Status transitions (submit, approve, reject) added in the next sprint.
/// </summary>
public sealed class ApplicationAggregate : BaseEntity
{
    public Guid PropertyId { get; private set; }
    public Guid TenantId { get; private set; }
    public string Status { get; private set; } = "Pending"; // Pending | Approved | Rejected
    public string? CoverLetter { get; private set; }

    private ApplicationAggregate() { } // EF Core ctor

    public static ApplicationAggregate Create(Guid propertyId, Guid tenantId, string? coverLetter = null)
    {
        return new ApplicationAggregate
        {
            Id = Guid.NewGuid(),
            PropertyId = propertyId,
            TenantId = tenantId,
            Status = "Pending",
            CoverLetter = coverLetter,
            CreatedAt = DateTime.UtcNow
        };
    }
}
