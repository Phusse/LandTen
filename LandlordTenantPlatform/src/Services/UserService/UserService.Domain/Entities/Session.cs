using BuildingBlocks.Common.Abstractions;

namespace UserService.Domain.Entities;

public class Session : BaseEntity
{
    public Guid UserId { get; set; }
    public string RefreshToken { get; set; } = string.Empty;
    public string DeviceInfo { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;

    // Navigation
    public User User { get; set; } = null!;
}
