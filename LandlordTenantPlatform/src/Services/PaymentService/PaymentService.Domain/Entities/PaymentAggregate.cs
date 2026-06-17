using BuildingBlocks.Common.Abstractions;

namespace PaymentService.Domain.Entities;

/// <summary>
/// Root aggregate representing a rental payment transaction.
/// Payment gateway integration (Paystack / Flutterwave) added in the next sprint.
/// </summary>
public sealed class PaymentAggregate : BaseEntity
{
    public Guid TenantId { get; private set; }
    public Guid PropertyId { get; private set; }
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "NGN";
    public string Status { get; private set; } = "Pending"; // Pending | Successful | Failed
    public string? Reference { get; private set; }

    private PaymentAggregate() { } // EF Core ctor

    public static PaymentAggregate Create(
        Guid tenantId, Guid propertyId, decimal amount, string? reference = null)
    {
        return new PaymentAggregate
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PropertyId = propertyId,
            Amount = amount,
            Status = "Pending",
            Reference = reference,
            CreatedAt = DateTime.UtcNow
        };
    }
}
