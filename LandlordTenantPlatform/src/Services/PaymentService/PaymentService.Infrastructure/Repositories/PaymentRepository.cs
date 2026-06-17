using Microsoft.EntityFrameworkCore;
using PaymentService.Application.Interfaces;
using PaymentService.Domain.Entities;
using PaymentService.Infrastructure.Data;

namespace PaymentService.Infrastructure.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly PaymentServiceDbContext _context;

    public PaymentRepository(PaymentServiceDbContext context)
    {
        _context = context;
    }

    public async Task<Wallet?> GetWalletByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);
    }

    public async Task AddWalletAsync(Wallet wallet, CancellationToken cancellationToken = default)
    {
        await _context.Wallets.AddAsync(wallet, cancellationToken);
    }

    public async Task<Transaction?> GetTransactionByReferenceAsync(string reference, CancellationToken cancellationToken = default)
    {
        return await _context.Transactions.FirstOrDefaultAsync(t => t.Reference == reference, cancellationToken);
    }

    public async Task AddTransactionAsync(Transaction transaction, CancellationToken cancellationToken = default)
    {
        await _context.Transactions.AddAsync(transaction, cancellationToken);
    }

    public async Task<Escrow?> GetEscrowByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Escrows.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task AddEscrowAsync(Escrow escrow, CancellationToken cancellationToken = default)
    {
        await _context.Escrows.AddAsync(escrow, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
