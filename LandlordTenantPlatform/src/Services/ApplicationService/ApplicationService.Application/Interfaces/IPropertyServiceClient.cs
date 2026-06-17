namespace ApplicationService.Application.Interfaces;

public class PropertyDto
{
    public Guid Id { get; set; }
    public Guid LandlordId { get; set; }
    public string Status { get; set; } = string.Empty;
}

public interface IPropertyServiceClient
{
    Task<PropertyDto?> GetPropertyAsync(Guid propertyId, CancellationToken cancellationToken = default);
    Task<List<Guid>> GetPropertiesByLandlordAsync(Guid landlordId, CancellationToken cancellationToken = default);
}
