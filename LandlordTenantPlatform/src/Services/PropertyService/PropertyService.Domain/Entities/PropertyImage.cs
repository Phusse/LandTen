using BuildingBlocks.Common.Abstractions;

namespace PropertyService.Domain.Entities;

public class PropertyImage : BaseEntity
{
    public Guid PropertyId { get; set; }
    public string Url { get; set; } = string.Empty;

    // Navigation
    public Property Property { get; set; } = null!;
}
