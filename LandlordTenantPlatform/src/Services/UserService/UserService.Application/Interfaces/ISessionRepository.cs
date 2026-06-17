using UserService.Domain.Entities;

namespace UserService.Application.Interfaces;

public interface ISessionRepository
{
    Task<Session?> GetByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
    Task AddAsync(Session session, CancellationToken cancellationToken = default);
    void Update(Session session);
    Task DeleteAllForUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
