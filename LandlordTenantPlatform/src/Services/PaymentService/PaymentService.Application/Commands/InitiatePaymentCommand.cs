using MediatR;
using BuildingBlocks.Common.Wrappers;
using PaymentService.Application.Interfaces;
using PaymentService.Domain.Entities;
using PaymentService.Domain.Enums;

namespace PaymentService.Application.Commands;

public record InitiatePaymentCommand(Guid UserId, decimal Amount, TransactionType Type) : IRequest<Result<string>>;

public class InitiatePaymentCommandHandler : IRequestHandler<InitiatePaymentCommand, Result<string>>
{
    private readonly IPaymentRepository _repository;

    public InitiatePaymentCommandHandler(IPaymentRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<string>> Handle(InitiatePaymentCommand request, CancellationToken cancellationToken)
    {
        var userId = request.UserId;
        if (userId == Guid.Empty) return Result<string>.Failure("User not authenticated.");

        if (request.Amount <= 0) return Result<string>.Failure("Amount must be greater than zero.");

        var reference = $"TXN-{Guid.NewGuid():N}";
        var transaction = Transaction.CreatePending(userId, request.Amount, request.Type, reference);

        await _repository.AddTransactionAsync(transaction, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        // TODO: Call actual provider (Paystack/Flutterwave) to generate payment link.
        return Result<string>.Success(reference);
    }
}
