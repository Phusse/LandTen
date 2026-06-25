using UserService.Domain.Entities;

namespace UserService.Application.Interfaces;

public interface IAdminActionLogRepository
{
    Task AddAsync(AdminActionLog log, CancellationToken cancellationToken = default);
    Task<string?> GetLastSuspensionReasonAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<AdminActionLog>> GetAuditLogAsync(int pageSize, CancellationToken cancellationToken = default);
}
