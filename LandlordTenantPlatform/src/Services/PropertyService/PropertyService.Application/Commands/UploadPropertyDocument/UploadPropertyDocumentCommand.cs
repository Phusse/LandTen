using FluentValidation;
using MediatR;
using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using PropertyService.Application.Interfaces;
using PropertyService.Domain.Entities;
using PropertyService.Domain.Enums;

namespace PropertyService.Application.Commands.UploadPropertyDocument;

public record UploadPropertyDocumentResult(Guid DocumentId, string Status);

public record UploadPropertyDocumentCommand(Guid LandlordId, Guid PropertyId, string DocumentType, string FileUrl) : IRequest<Result<UploadPropertyDocumentResult>>;

public class UploadPropertyDocumentCommandValidator : AbstractValidator<UploadPropertyDocumentCommand>
{
    public UploadPropertyDocumentCommandValidator()
    {
        RuleFor(x => x.LandlordId).NotEmpty();
        RuleFor(x => x.PropertyId).NotEmpty();
        RuleFor(x => x.DocumentType).NotEmpty();
        RuleFor(x => x.FileUrl).NotEmpty();
    }
}

public class UploadPropertyDocumentCommandHandler : IRequestHandler<UploadPropertyDocumentCommand, Result<UploadPropertyDocumentResult>>
{
    private readonly IPropertyRepository _propertyRepository;

    public UploadPropertyDocumentCommandHandler(IPropertyRepository propertyRepository)
    {
        _propertyRepository = propertyRepository;
    }

    public async Task<Result<UploadPropertyDocumentResult>> Handle(UploadPropertyDocumentCommand request, CancellationToken cancellationToken)
    {
        var property = await _propertyRepository.GetByIdAsync(request.PropertyId, cancellationToken);
        if (property == null)
        {
            throw new NotFoundException($"Property with ID {request.PropertyId} not found.");
        }

        if (property.LandlordId != request.LandlordId)
        {
            throw new UnauthorizedAccessException("You can only upload documents for your own property.");
        }

        var document = new PropertyDocument
        {
            PropertyId = property.Id,
            DocumentType = request.DocumentType,
            FileUrl = request.FileUrl,
            Status = PropertyDocumentStatus.Pending
        };

        await _propertyRepository.AddPropertyDocumentAsync(document, cancellationToken);
        await _propertyRepository.SaveChangesAsync(cancellationToken);

        return Result<UploadPropertyDocumentResult>.Success(new UploadPropertyDocumentResult(document.Id, document.Status.ToString().ToLower()));
    }
}
