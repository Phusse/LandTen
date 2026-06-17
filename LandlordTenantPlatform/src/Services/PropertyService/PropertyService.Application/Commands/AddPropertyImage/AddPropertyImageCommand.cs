using FluentValidation;
using MediatR;
using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using PropertyService.Application.Interfaces;
using PropertyService.Domain.Entities;

namespace PropertyService.Application.Commands.AddPropertyImage;

public record AddPropertyImageResult(Guid ImageId, string Url);

public record AddPropertyImageCommand(Guid PropertyId, Guid LandlordId, string FileUrl) : IRequest<Result<AddPropertyImageResult>>;

public class AddPropertyImageCommandValidator : AbstractValidator<AddPropertyImageCommand>
{
    public AddPropertyImageCommandValidator()
    {
        RuleFor(x => x.PropertyId).NotEmpty();
        RuleFor(x => x.LandlordId).NotEmpty();
        RuleFor(x => x.FileUrl).NotEmpty();
    }
}

public class AddPropertyImageCommandHandler : IRequestHandler<AddPropertyImageCommand, Result<AddPropertyImageResult>>
{
    private readonly IPropertyRepository _repository;

    public AddPropertyImageCommandHandler(IPropertyRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AddPropertyImageResult>> Handle(AddPropertyImageCommand request, CancellationToken cancellationToken)
    {
        var property = await _repository.GetByIdWithImagesAsync(request.PropertyId, cancellationToken);
        if (property == null)
        {
            throw new NotFoundException($"Property {request.PropertyId} not found.");
        }

        if (property.LandlordId != request.LandlordId)
        {
            throw new ForbiddenException("You are not the owner of this property.");
        }

        var propertyImage = new PropertyImage
        {
            PropertyId = property.Id,
            Url = request.FileUrl
        };

        await _repository.AddImageAsync(propertyImage, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        return Result<AddPropertyImageResult>.Success(new AddPropertyImageResult(propertyImage.Id, propertyImage.Url));
    }
}
