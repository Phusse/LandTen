using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using MediatR;
using PropertyService.Application.Interfaces;
using PropertyService.Domain.Enums;

namespace PropertyService.Application.Commands.RejectPropertyVerification;

public record RejectPropertyVerificationCommand(Guid PropertyId, Guid ReviewerId) : IRequest<Result<string>>;

public class RejectPropertyVerificationCommandHandler : IRequestHandler<RejectPropertyVerificationCommand, Result<string>>
{
    private readonly IPropertyRepository _propertyRepository;

    public RejectPropertyVerificationCommandHandler(IPropertyRepository propertyRepository)
    {
        _propertyRepository = propertyRepository;
    }

    public async Task<Result<string>> Handle(RejectPropertyVerificationCommand request, CancellationToken cancellationToken)
    {
        var property = await _propertyRepository.GetByIdWithDocumentsAsync(request.PropertyId, cancellationToken);
        if (property == null)
        {
            throw new NotFoundException($"Property with ID {request.PropertyId} not found.");
        }

        var pendingDocs = property.Documents.Where(d => d.Status == PropertyDocumentStatus.Pending).ToList();
        if (!pendingDocs.Any())
        {
            return Result<string>.Failure("No pending documents found for this property.");
        }

        foreach (var doc in pendingDocs)
        {
            doc.Status = PropertyDocumentStatus.Rejected;
            doc.ReviewedBy = request.ReviewerId;
        }

        await _propertyRepository.SaveChangesAsync(cancellationToken);

        return Result<string>.Success("Property documents rejected");
    }
}
