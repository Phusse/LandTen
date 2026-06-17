using FluentValidation;
using MediatR;
using MassTransit;
using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using BuildingBlocks.EventBus.Events;
using UserService.Application.Interfaces;
using UserService.Domain.Enums;

namespace UserService.Application.Commands.ApproveKyc;

public record ApproveKycResult(bool FullyVerified);

public record ApproveKycCommand(Guid DocumentId, Guid ReviewerId) : IRequest<Result<ApproveKycResult>>;

public class ApproveKycCommandValidator : AbstractValidator<ApproveKycCommand>
{
    public ApproveKycCommandValidator()
    {
        RuleFor(x => x.DocumentId).NotEmpty();
        RuleFor(x => x.ReviewerId).NotEmpty();
    }
}

public class ApproveKycCommandHandler : IRequestHandler<ApproveKycCommand, Result<ApproveKycResult>>
{
    private readonly IUserRepository _userRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public ApproveKycCommandHandler(IUserRepository userRepository, IPublishEndpoint publishEndpoint)
    {
        _userRepository = userRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Result<ApproveKycResult>> Handle(ApproveKycCommand request, CancellationToken cancellationToken)
    {
        var document = await _userRepository.GetKycDocumentByIdAsync(request.DocumentId, cancellationToken);
        if (document == null)
        {
            throw new NotFoundException($"KYC Document {request.DocumentId} not found.");
        }

        if (document.Status != KycDocumentStatus.Pending)
        {
            throw new ConflictException("Document is not in pending status.");
        }

        document.Status = KycDocumentStatus.Approved;
        document.ReviewedBy = request.ReviewerId;

        var user = document.User;
        var fullyVerified = false;

        // If there are no other pending or rejected docs, mark user as Verified
        var hasPendingOrRejected = user.KycDocuments.Any(d => d.Id != document.Id && d.Status != KycDocumentStatus.Approved);
        if (!hasPendingOrRejected)
        {
            user.ChangeVerificationStatus(VerificationStatus.Verified);
            fullyVerified = true;
        }

        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync(cancellationToken);

        if (fullyVerified)
        {
            await _publishEndpoint.Publish(new UserVerifiedEvent(user.Id), cancellationToken);
        }

        return Result<ApproveKycResult>.Success(new ApproveKycResult(fullyVerified));
    }
}
