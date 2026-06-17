using BuildingBlocks.Common.Abstractions;
using PaymentService.Domain.Enums;

namespace PaymentService.Domain.Entities;

public class Transaction : BaseEntity
{
    public Guid UserId { get; private set; }
    public decimal Amount { get; private set; }
    public TransactionType Type { get; private set; }
    public TransactionStatus Status { get; private set; }
    public string Reference { get; private set; } = string.Empty;

    private Transaction() { } // EF Core

    private Transaction(Guid userId, decimal amount, TransactionType type, string reference)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        Amount = amount;
        Type = type;
        Status = TransactionStatus.Pending;
        Reference = reference;
        CreatedAt = DateTime.UtcNow;
    }

    public static Transaction CreatePending(Guid userId, decimal amount, TransactionType type, string reference)
    {
        return new Transaction(userId, amount, type, reference);
    }

    public void MarkCompleted()
    {
        if (Status != TransactionStatus.Pending) throw new InvalidOperationException("Only pending transactions can be completed.");
        Status = TransactionStatus.Completed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkFailed()
    {
        if (Status != TransactionStatus.Pending) throw new InvalidOperationException("Only pending transactions can be failed.");
        Status = TransactionStatus.Failed;
        UpdatedAt = DateTime.UtcNow;
    }
}
