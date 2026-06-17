using BuildingBlocks.Common.Abstractions;
using BuildingBlocks.Common.Exceptions;
using UserService.Domain.Enums;

namespace UserService.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    
    public UserRole Role { get; set; }
    public UserStatus Status { get; set; } = UserStatus.Active;
    public VerificationStatus VerificationStatus { get; private set; } = VerificationStatus.Unverified;

    // Navigation
    public UserProfile UserProfile { get; set; } = null!;
    public ICollection<KycDocument> KycDocuments { get; set; } = new List<KycDocument>();
    public ICollection<Session> Sessions { get; set; } = new List<Session>();

    // Constructor for EF Core
    protected User() { }

    public User(string email, string phone, string passwordHash, UserRole role)
    {
        Id = Guid.NewGuid();
        Email = email;
        Phone = phone;
        PasswordHash = passwordHash;
        Role = role;
        VerificationStatus = VerificationStatus.Unverified;
        Status = UserStatus.Active;
    }

    /// <summary>
    /// Evaluates whether the user can list a property.
    /// Expose `User.CanListProperty()` => true only if Role == Landlord AND VerificationStatus == Verified.
    /// </summary>
    public bool CanListProperty()
    {
        return Role == UserRole.Landlord && VerificationStatus == VerificationStatus.Verified;
    }

    /// <summary>
    /// Changes the verification status following the state machine rules:
    /// Unverified -> Pending -> Verified or Rejected
    /// Rejected -> Pending only
    /// </summary>
    public void ChangeVerificationStatus(VerificationStatus newStatus)
    {
        if (VerificationStatus == newStatus)
            return;

        bool isValidTransition = (VerificationStatus, newStatus) switch
        {
            (VerificationStatus.Unverified, VerificationStatus.Pending) => true,
            (VerificationStatus.Pending, VerificationStatus.Verified) => true,
            (VerificationStatus.Pending, VerificationStatus.Rejected) => true,
            (VerificationStatus.Rejected, VerificationStatus.Pending) => true,
            _ => false
        };

        if (!isValidTransition)
        {
            throw new ConflictException($"Invalid verification state transition from {VerificationStatus} to {newStatus}");
        }

        VerificationStatus = newStatus;
    }
}
