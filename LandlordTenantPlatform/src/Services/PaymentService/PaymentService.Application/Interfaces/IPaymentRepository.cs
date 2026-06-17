using PaymentService.Domain.Entities;

namespace PaymentService.Application.Interfaces;

public interface IPaymentRepository
{
    Task<Wallet?> GetWalletByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddWalletAsync(Wallet wallet, CancellationToken cancellationToken = default);
    
    Task<Transaction?> GetTransactionByReferenceAsync(string reference, CancellationToken cancellationToken = default);
    Task AddTransactionAsync(Transaction transaction, CancellationToken cancellationToken = default);
    
    Task<Escrow?> GetEscrowByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddEscrowAsync(Escrow escrow, CancellationToken cancellationToken = default);
    
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
