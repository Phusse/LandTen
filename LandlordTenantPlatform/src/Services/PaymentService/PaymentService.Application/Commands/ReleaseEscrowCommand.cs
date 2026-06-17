using MediatR;
using BuildingBlocks.Common.Wrappers;
using PaymentService.Application.Interfaces;
using PaymentService.Domain.Enums;

namespace PaymentService.Application.Commands;

public record ReleaseEscrowCommand(Guid EscrowId, Guid UserId, bool IsAdmin) : IRequest<Result<string>>;

public class ReleaseEscrowCommandHandler : IRequestHandler<ReleaseEscrowCommand, Result<string>>
{
    private readonly IPaymentRepository _repository;

    public ReleaseEscrowCommandHandler(IPaymentRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<string>> Handle(ReleaseEscrowCommand request, CancellationToken cancellationToken)
    {
        var escrow = await _repository.GetEscrowByIdAsync(request.EscrowId, cancellationToken);
        if (escrow == null) return Result<string>.Failure("Escrow not found.");

        // Check ownership or admin
        if (request.UserId != escrow.LandlordId && !request.IsAdmin)
        {
            return Result<string>.Failure("Not authorized to release this escrow.");
        }

        try
        {
            escrow.ReleaseToLandlord();
            // TODO: Phase 2 - Move funds from Escrow to Landlord Wallet
            await _repository.SaveChangesAsync(cancellationToken);
            return Result<string>.Success("Escrow released successfully.");
        }
        catch (Exception ex)
        {
            return Result<string>.Failure(ex.Message);
        }
    }
}
