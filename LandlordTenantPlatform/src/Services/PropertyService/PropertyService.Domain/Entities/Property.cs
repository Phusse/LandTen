using BuildingBlocks.Common.Abstractions;
using PropertyService.Domain.Enums;

namespace PropertyService.Domain.Entities;

public class Property : BaseEntity
{
    public Guid LandlordId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public decimal RentPrice { get; set; }
    public int Rooms { get; set; }
    public int Bathrooms { get; set; }
    public string PropertyType { get; set; } = string.Empty;
    public PropertyStatus Status { get; set; } = PropertyStatus.Available;
    public bool Verified { get; set; } = false;

    // Navigation
    public ICollection<PropertyImage> Images { get; set; } = new List<PropertyImage>();
    public ICollection<PropertyDocument> Documents { get; set; } = new List<PropertyDocument>();
}
