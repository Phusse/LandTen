using FluentValidation;
using MediatR;
using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using UserService.Application.Interfaces;
using UserService.Domain.Enums;

namespace UserService.Application.Commands.RejectKyc;

public record RejectKycResult(Guid DocumentId, string Status);

public record RejectKycCommand(Guid DocumentId, Guid ReviewerId) : IRequest<Result<RejectKycResult>>;

public class RejectKycCommandValidator : AbstractValidator<RejectKycCommand>
{
    public RejectKycCommandValidator()
    {
        RuleFor(x => x.DocumentId).NotEmpty();
        RuleFor(x => x.ReviewerId).NotEmpty();
    }
}

public class RejectKycCommandHandler : IRequestHandler<RejectKycCommand, Result<RejectKycResult>>
{
    private readonly IUserRepository _userRepository;

    public RejectKycCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<RejectKycResult>> Handle(RejectKycCommand request, CancellationToken cancellationToken)
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

        document.Status = KycDocumentStatus.Rejected;
        document.ReviewedBy = request.ReviewerId;

        var user = document.User;
        
        // If a doc is rejected, set user verification status to Rejected
        if (user.VerificationStatus != VerificationStatus.Rejected)
        {
            user.ChangeVerificationStatus(VerificationStatus.Rejected);
        }

        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync(cancellationToken);

        return Result<RejectKycResult>.Success(new RejectKycResult(document.Id, document.Status.ToString().ToLower()));
    }
}
