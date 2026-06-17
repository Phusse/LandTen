using BuildingBlocks.Common.Abstractions;
using PaymentService.Domain.Enums;

namespace PaymentService.Domain.Entities;

public class Escrow : BaseEntity
{
    public Guid PropertyId { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid LandlordId { get; private set; }
    public decimal Amount { get; private set; }
    public EscrowStatus Status { get; private set; }

    private Escrow() { } // EF Core

    private Escrow(Guid propertyId, Guid tenantId, Guid landlordId, decimal amount)
    {
        Id = Guid.NewGuid();
        PropertyId = propertyId;
        TenantId = tenantId;
        LandlordId = landlordId;
        Amount = amount;
        Status = EscrowStatus.Held;
        CreatedAt = DateTime.UtcNow;
    }

    public static Escrow Create(Guid propertyId, Guid tenantId, Guid landlordId, decimal amount)
    {
        return new Escrow(propertyId, tenantId, landlordId, amount);
    }

    public void ReleaseToLandlord()
    {
        if (Status != EscrowStatus.Held) throw new InvalidOperationException("Can only release held funds.");
        Status = EscrowStatus.Released;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RefundToTenant()
    {
        if (Status != EscrowStatus.Held) throw new InvalidOperationException("Can only refund held funds.");
        Status = EscrowStatus.Refunded;
        UpdatedAt = DateTime.UtcNow;
    }
}
