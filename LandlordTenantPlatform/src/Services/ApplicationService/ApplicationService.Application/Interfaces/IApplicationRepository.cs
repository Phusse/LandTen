using ApplicationEntity = ApplicationService.Domain.Entities.Application;

namespace ApplicationService.Application.Interfaces;

public interface IApplicationRepository
{
    Task<ApplicationEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<ApplicationEntity>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<List<ApplicationEntity>> GetByPropertyIdsAsync(IEnumerable<Guid> propertyIds, CancellationToken cancellationToken = default);
    Task<bool> ExistsForTenantAndPropertyAsync(Guid tenantId, Guid propertyId, CancellationToken cancellationToken = default);
    Task AddAsync(ApplicationEntity application, CancellationToken cancellationToken = default);
    Task UpdateAsync(ApplicationEntity application, CancellationToken cancellationToken = default);
}
