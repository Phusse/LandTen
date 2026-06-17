using Microsoft.EntityFrameworkCore;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;
using UserService.Domain.Enums;
using UserService.Infrastructure.Data;

namespace UserService.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly UserServiceDbContext _context;

    public UserRepository(UserServiceDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(u => u.UserProfile)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(u => u.UserProfile)
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<User?> GetByPhoneAsync(string phone, CancellationToken cancellationToken = default)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Phone == phone, cancellationToken);
    }

    public async Task<User?> GetByIdWithKycAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(u => u.KycDocuments)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await _context.Users.AddAsync(user, cancellationToken);
    }

    public void Update(User user)
    {
        _context.Users.Update(user);
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<(IEnumerable<User> Users, int TotalCount)> GetPaginatedUsersAsync(int pageNumber, int pageSize, string? search, CancellationToken cancellationToken = default)
    {
        var query = _context.Users
            .Include(u => u.UserProfile)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(u => 
                u.Email.ToLower().Contains(searchLower) || 
                (u.UserProfile != null && u.UserProfile.FirstName.ToLower().Contains(searchLower)) ||
                (u.UserProfile != null && u.UserProfile.LastName.ToLower().Contains(searchLower)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (users, totalCount);
    }

    public async Task<IEnumerable<KycDocument>> GetPendingKycDocumentsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.KycDocuments
            .Include(k => k.User)
                .ThenInclude(u => u.UserProfile)
            .Where(k => k.Status == KycDocumentStatus.Pending)
            .ToListAsync(cancellationToken);
    }

    public async Task<KycDocument?> GetKycDocumentByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.KycDocuments
            .Include(k => k.User)
                .ThenInclude(u => u.KycDocuments)
            .FirstOrDefaultAsync(k => k.Id == id, cancellationToken);
    }

    public async Task AddKycDocumentAsync(KycDocument document, CancellationToken cancellationToken = default)
    {
        await _context.KycDocuments.AddAsync(document, cancellationToken);
    }
}
