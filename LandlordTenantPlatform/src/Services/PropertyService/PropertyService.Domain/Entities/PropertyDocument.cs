using BuildingBlocks.Common.Abstractions;
using PropertyService.Domain.Enums;

namespace PropertyService.Domain.Entities;

public class PropertyDocument : BaseEntity
{
    public Guid PropertyId { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public PropertyDocumentStatus Status { get; set; } = PropertyDocumentStatus.Pending;
    public Guid? ReviewedBy { get; set; }

    // Navigation
    public Property Property { get; set; } = null!;
}
