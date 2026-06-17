using MediatR;
using MassTransit;
using BuildingBlocks.Common.Wrappers;
using BuildingBlocks.EventBus.Events;
using PaymentService.Application.Interfaces;
using PaymentService.Domain.Enums;

namespace PaymentService.Application.Commands;

public record HandlePaymentWebhookCommand(string Reference, bool IsSuccessful) : IRequest<Result<string>>;

public class HandlePaymentWebhookCommandHandler : IRequestHandler<HandlePaymentWebhookCommand, Result<string>>
{
    private readonly IPaymentRepository _repository;
    private readonly IPublishEndpoint _publishEndpoint;

    public HandlePaymentWebhookCommandHandler(IPaymentRepository repository, IPublishEndpoint publishEndpoint)
    {
        _repository = repository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Result<string>> Handle(HandlePaymentWebhookCommand request, CancellationToken cancellationToken)
    {
        // TODO: Validate webhook signature here using Provider Secret Key

        var transaction = await _repository.GetTransactionByReferenceAsync(request.Reference, cancellationToken);
        if (transaction == null) return Result<string>.Failure("Transaction not found.");

        if (transaction.Status != TransactionStatus.Pending)
        {
            return Result<string>.Success("Transaction already processed.");
        }

        if (request.IsSuccessful)
        {
            transaction.MarkCompleted();
            // TODO: In Phase 2, this is where we actually update the Wallet balance based on Txn Type.
            
            await _publishEndpoint.Publish(new PaymentCompletedEvent(
                transaction.Id,
                transaction.UserId,
                transaction.Amount
            ), cancellationToken);
        }
        else
        {
            transaction.MarkFailed();
        }

        await _repository.SaveChangesAsync(cancellationToken);

        return Result<string>.Success("Webhook processed successfully.");
    }
}
