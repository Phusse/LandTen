using BuildingBlocks.Common.Abstractions;
using ApplicationService.Domain.Enums;

namespace ApplicationService.Domain.Entities;

public class Application : BaseEntity
{
    public Guid TenantId { get; private set; }
    public Guid PropertyId { get; private set; }
    public ApplicationStatus Status { get; private set; }
    public DateTime? InspectionDate { get; private set; }

    private Application() { } // EF Core

    public static Application Create(Guid tenantId, Guid propertyId)
    {
        return new Application
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PropertyId = propertyId,
            Status = ApplicationStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void UpdateStatus(ApplicationStatus newStatus)
    {
        Status = newStatus;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ScheduleInspection(DateTime inspectionDate)
    {
        InspectionDate = inspectionDate;
        UpdatedAt = DateTime.UtcNow;
    }
}
