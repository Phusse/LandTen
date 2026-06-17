using BuildingBlocks.Common.Abstractions;

namespace UserService.Domain.Entities;

public class UserProfile : BaseEntity
{
    public Guid UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    
    // Navigation
    public User User { get; set; } = null!;
}
