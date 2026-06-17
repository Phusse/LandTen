using BuildingBlocks.Common.Abstractions;

namespace PaymentService.Domain.Entities;

public class Wallet : BaseEntity
{
    public Guid UserId { get; private set; }
    public decimal Balance { get; private set; }

    private Wallet() { } // EF Core

    private Wallet(Guid userId)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        Balance = 0m;
        CreatedAt = DateTime.UtcNow;
    }

    public static Wallet Create(Guid userId)
    {
        return new Wallet(userId);
    }

    public void AddFunds(decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("Amount must be greater than zero.", nameof(amount));
        Balance += amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void DeductFunds(decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("Amount must be greater than zero.", nameof(amount));
        if (Balance < amount) throw new InvalidOperationException("Insufficient funds.");
        Balance -= amount;
        UpdatedAt = DateTime.UtcNow;
    }
}
