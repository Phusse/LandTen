using MediatR;
using BuildingBlocks.Common.Wrappers;
using PaymentService.Application.Interfaces;

namespace PaymentService.Application.Commands;

public record RefundEscrowCommand(Guid EscrowId, bool IsAdmin) : IRequest<Result<string>>;

public class RefundEscrowCommandHandler : IRequestHandler<RefundEscrowCommand, Result<string>>
{
    private readonly IPaymentRepository _repository;

    public RefundEscrowCommandHandler(IPaymentRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<string>> Handle(RefundEscrowCommand request, CancellationToken cancellationToken)
    {
        var escrow = await _repository.GetEscrowByIdAsync(request.EscrowId, cancellationToken);
        if (escrow == null) return Result<string>.Failure("Escrow not found.");

        // Check admin only (as requested)
        if (!request.IsAdmin)
        {
            return Result<string>.Failure("Only an Admin can refund an escrow.");
        }

        try
        {
            escrow.RefundToTenant();
            // TODO: Phase 2 - Move funds from Escrow back to Tenant Wallet
            await _repository.SaveChangesAsync(cancellationToken);
            return Result<string>.Success("Escrow refunded successfully.");
        }
        catch (Exception ex)
        {
            return Result<string>.Failure(ex.Message);
        }
    }
}
