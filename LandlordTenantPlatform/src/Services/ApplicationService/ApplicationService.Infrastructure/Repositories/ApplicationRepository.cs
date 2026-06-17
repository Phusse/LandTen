using ApplicationEntity = ApplicationService.Domain.Entities.Application;
using ApplicationService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using ApplicationService.Application.Interfaces;

namespace ApplicationService.Infrastructure.Repositories;

public class ApplicationRepository : IApplicationRepository
{
    private readonly ApplicationServiceDbContext _context;

    public ApplicationRepository(ApplicationServiceDbContext context)
    {
        _context = context;
    }

    public async Task<ApplicationEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Applications.FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<List<ApplicationEntity>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.Applications
            .Where(a => a.TenantId == tenantId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ApplicationEntity>> GetByPropertyIdsAsync(IEnumerable<Guid> propertyIds, CancellationToken cancellationToken = default)
    {
        return await _context.Applications
            .Where(a => propertyIds.Contains(a.PropertyId))
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsForTenantAndPropertyAsync(Guid tenantId, Guid propertyId, CancellationToken cancellationToken = default)
    {
        return await _context.Applications.AnyAsync(a => a.TenantId == tenantId && a.PropertyId == propertyId, cancellationToken);
    }

    public async Task AddAsync(ApplicationEntity application, CancellationToken cancellationToken = default)
    {
        _context.Applications.Add(application);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(ApplicationEntity application, CancellationToken cancellationToken = default)
    {
        _context.Applications.Update(application);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
