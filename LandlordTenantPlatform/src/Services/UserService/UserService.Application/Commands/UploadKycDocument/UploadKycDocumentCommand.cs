using FluentValidation;
using MediatR;
using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;
using UserService.Domain.Enums;

namespace UserService.Application.Commands.UploadKycDocument;

public record UploadKycDocumentResult(Guid DocumentId, string Status);

public record UploadKycDocumentCommand(Guid UserId, string DocumentType, string FileUrl) : IRequest<Result<UploadKycDocumentResult>>;

public class UploadKycDocumentCommandValidator : AbstractValidator<UploadKycDocumentCommand>
{
    public UploadKycDocumentCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.DocumentType).NotEmpty();
        RuleFor(x => x.FileUrl).NotEmpty();
    }
}

public class UploadKycDocumentCommandHandler : IRequestHandler<UploadKycDocumentCommand, Result<UploadKycDocumentResult>>
{
    private readonly IUserRepository _userRepository;

    public UploadKycDocumentCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<UploadKycDocumentResult>> Handle(UploadKycDocumentCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException($"User with ID {request.UserId} not found.");
        }

        var document = new KycDocument
        {
            UserId = user.Id,
            DocumentType = request.DocumentType,
            FileUrl = request.FileUrl,
            Status = KycDocumentStatus.Pending
        };

        await _userRepository.AddKycDocumentAsync(document, cancellationToken);

        // If user was Rejected or Unverified, they transition to Pending once they upload a doc
        if (user.VerificationStatus == VerificationStatus.Unverified || user.VerificationStatus == VerificationStatus.Rejected)
        {
            user.ChangeVerificationStatus(VerificationStatus.Pending);
        }

        await _userRepository.SaveChangesAsync(cancellationToken);

        return Result<UploadKycDocumentResult>.Success(new UploadKycDocumentResult(document.Id, document.Status.ToString().ToLower()));
    }
}
