using PropertyService.Domain.Entities;

namespace PropertyService.Application.Interfaces;

public interface IPropertyRepository
{
    Task<Property?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Property?> GetByIdWithImagesAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Property?> GetByIdWithDocumentsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<(IEnumerable<Property> Items, int TotalCount)> SearchAsync(
        string? city, string? state, decimal? minRent, decimal? maxRent, int? minRooms, string? status, 
        int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task AddAsync(Property property, CancellationToken cancellationToken = default);
    Task AddImageAsync(PropertyImage image, CancellationToken cancellationToken = default);
    void Update(Property property);
    void Delete(Property property);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    Task<IEnumerable<PropertyDocument>> GetPendingPropertyDocumentsAsync(CancellationToken cancellationToken = default);
    Task<PropertyDocument?> GetPropertyDocumentByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddPropertyDocumentAsync(PropertyDocument document, CancellationToken cancellationToken = default);
}
