using BuildingBlocks.Common.Abstractions;
using UserService.Domain.Enums;

namespace UserService.Domain.Entities;

public class KycDocument : BaseEntity
{
    public Guid UserId { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public KycDocumentStatus Status { get; set; } = KycDocumentStatus.Pending;
    public Guid? ReviewedBy { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
