using MediatR;
using BuildingBlocks.Common.Wrappers;
using PaymentService.Application.Interfaces;
using PaymentService.Domain.Entities;

namespace PaymentService.Application.Queries;

public record GetWalletQuery(Guid UserId) : IRequest<Result<Wallet>>;

public class GetWalletQueryHandler : IRequestHandler<GetWalletQuery, Result<Wallet>>
{
    private readonly IPaymentRepository _repository;

    public GetWalletQueryHandler(IPaymentRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<Wallet>> Handle(GetWalletQuery request, CancellationToken cancellationToken)
    {
        var userId = request.UserId;
        if (userId == Guid.Empty) return Result<Wallet>.Failure("User not authenticated.");

        var wallet = await _repository.GetWalletByUserIdAsync(userId, cancellationToken);
        if (wallet == null)
        {
            wallet = Wallet.Create(userId);
            await _repository.AddWalletAsync(wallet, cancellationToken);
            await _repository.SaveChangesAsync(cancellationToken);
        }

        return Result<Wallet>.Success(wallet);
    }
}
