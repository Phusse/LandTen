using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using MassTransit;
using MediatR;
using PropertyService.Application.Interfaces;
using PropertyService.Domain.Enums;
using BuildingBlocks.EventBus.Events;

namespace PropertyService.Application.Commands.ApprovePropertyVerification;

public record ApprovePropertyVerificationCommand(Guid PropertyId, Guid ReviewerId) : IRequest<Result<string>>;

public class ApprovePropertyVerificationCommandHandler : IRequestHandler<ApprovePropertyVerificationCommand, Result<string>>
{
    private readonly IPropertyRepository _propertyRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public ApprovePropertyVerificationCommandHandler(IPropertyRepository propertyRepository, IPublishEndpoint publishEndpoint)
    {
        _propertyRepository = propertyRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Result<string>> Handle(ApprovePropertyVerificationCommand request, CancellationToken cancellationToken)
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
            doc.Status = PropertyDocumentStatus.Approved;
            doc.ReviewedBy = request.ReviewerId;
        }

        // Check if all documents for the property are now approved
        bool allApproved = property.Documents.All(d => d.Status == PropertyDocumentStatus.Approved);

        if (allApproved && !property.Verified)
        {
            property.Verified = true;
            // Publish event
            var @event = new PropertyVerifiedEvent(property.Id, property.LandlordId);
            await _publishEndpoint.Publish(@event, cancellationToken);
        }

        await _propertyRepository.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(property.Verified ? "Property fully verified" : "Documents approved");
    }
}
