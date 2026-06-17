using UserService.Domain.Entities;

namespace UserService.Application.Interfaces;

public interface IAdminActionLogRepository
{
    Task AddAsync(AdminActionLog log, CancellationToken cancellationToken = default);
}
