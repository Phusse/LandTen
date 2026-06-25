using UserService.Domain.Entities;
using UserService.Domain.Enums;

namespace UserService.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByPhoneAsync(string phone, CancellationToken cancellationToken = default);
    Task<User?> GetByIdWithKycAsync(Guid id, CancellationToken cancellationToken = default);
    Task<(IEnumerable<User> Users, int TotalCount)> GetPaginatedUsersAsync(int pageNumber, int pageSize, string? search, CancellationToken cancellationToken = default);
    Task AddAsync(User user, CancellationToken cancellationToken = default);
    void Update(User user);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<KycDocument>> GetKycDocumentsAsync(KycDocumentStatus? status = null, CancellationToken cancellationToken = default);
    Task<KycDocument?> GetKycDocumentByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddKycDocumentAsync(KycDocument document, CancellationToken cancellationToken = default);
}
