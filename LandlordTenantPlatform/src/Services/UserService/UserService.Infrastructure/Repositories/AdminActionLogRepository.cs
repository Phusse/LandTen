using Microsoft.EntityFrameworkCore;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;
using UserService.Infrastructure.Data;

namespace UserService.Infrastructure.Repositories;

public class AdminActionLogRepository : IAdminActionLogRepository
{
    private readonly UserServiceDbContext _context;

    public AdminActionLogRepository(UserServiceDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(AdminActionLog log, CancellationToken cancellationToken = default)
    {
        await _context.AdminActionLogs.AddAsync(log, cancellationToken);
    }

    public async Task<string?> GetLastSuspensionReasonAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.AdminActionLogs
            .Where(l => l.TargetUserId == userId && l.Action == "Suspend")
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => l.Reason)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<AdminActionLog>> GetAuditLogAsync(int pageSize, CancellationToken cancellationToken = default)
    {
        return await _context.AdminActionLogs
            .Include(l => l.TargetUser).ThenInclude(u => u.UserProfile)
            .OrderByDescending(l => l.CreatedAt)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }
}
