using BuildingBlocks.Common.Abstractions;

namespace UserService.Domain.Entities;

public class AdminActionLog : BaseEntity
{
    public Guid TargetUserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public Guid PerformedBy { get; set; }
    
    // Navigation
    public User TargetUser { get; set; } = null!;
}
