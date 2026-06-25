using Microsoft.EntityFrameworkCore;
using PropertyService.Application.Interfaces;
using PropertyService.Domain.Entities;
using PropertyService.Domain.Enums;
using PropertyService.Infrastructure.Data;

namespace PropertyService.Infrastructure.Repositories;

public class PropertyRepository : IPropertyRepository
{
    private readonly PropertyServiceDbContext _context;

    public PropertyRepository(PropertyServiceDbContext context)
    {
        _context = context;
    }

    public async Task<Property?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Properties.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<Property?> GetByIdWithImagesAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Properties
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<Property?> GetByIdWithDocumentsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Properties
            .Include(p => p.Documents)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<(IEnumerable<Property> Items, int TotalCount)> SearchAsync(
        string? city, string? state, decimal? minRent, decimal? maxRent, int? minRooms, string? status, 
        int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.Properties.Include(p => p.Images).AsQueryable();

        if (!string.IsNullOrWhiteSpace(city))
        {
            query = query.Where(p => p.City.ToLower() == city.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(state))
        {
            query = query.Where(p => p.State.ToLower() == state.ToLower());
        }

        if (minRent.HasValue)
        {
            query = query.Where(p => p.RentPrice >= minRent.Value);
        }

        if (maxRent.HasValue)
        {
            query = query.Where(p => p.RentPrice <= maxRent.Value);
        }

        if (minRooms.HasValue)
        {
            query = query.Where(p => p.Rooms >= minRooms.Value);
        }

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<PropertyStatus>(status, true, out var parsedStatus))
        {
            query = query.Where(p => p.Status == parsedStatus);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task AddAsync(Property property, CancellationToken cancellationToken = default)
    {
        await _context.Properties.AddAsync(property, cancellationToken);
    }

    public async Task AddImageAsync(PropertyImage image, CancellationToken cancellationToken = default)
    {
        await _context.PropertyImages.AddAsync(image, cancellationToken);
    }

    public void Update(Property property)
    {
        _context.Properties.Update(property);
    }

    public void Delete(Property property)
    {
        _context.Properties.Remove(property);
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<PropertyDocument>> GetPropertyDocumentsAsync(PropertyDocumentStatus? status = null, CancellationToken cancellationToken = default)
    {
        var query = _context.PropertyDocuments
            .Include(d => d.Property)
            .AsQueryable();
            
        if (status.HasValue)
        {
            query = query.Where(d => d.Status == status.Value);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<PropertyDocument?> GetPropertyDocumentByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.PropertyDocuments
            .Include(d => d.Property)
                .ThenInclude(p => p.Documents)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
    }

    public async Task AddPropertyDocumentAsync(PropertyDocument document, CancellationToken cancellationToken = default)
    {
        await _context.PropertyDocuments.AddAsync(document, cancellationToken);
    }
}
