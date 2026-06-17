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
}
