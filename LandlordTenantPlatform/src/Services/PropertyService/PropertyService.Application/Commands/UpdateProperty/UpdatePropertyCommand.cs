using FluentValidation;
using MediatR;
using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using PropertyService.Application.Interfaces;

namespace PropertyService.Application.Commands.UpdateProperty;

public record UpdatePropertyCommand(
    Guid PropertyId,
    Guid LandlordId,
    string Title,
    string Description,
    string Address,
    string City,
    string State,
    decimal RentPrice,
    int Rooms,
    int Bathrooms,
    string PropertyType) : IRequest<Result>;

public class UpdatePropertyCommandValidator : AbstractValidator<UpdatePropertyCommand>
{
    public UpdatePropertyCommandValidator()
    {
        RuleFor(x => x.PropertyId).NotEmpty();
        RuleFor(x => x.LandlordId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Address).NotEmpty().MaximumLength(500);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.State).NotEmpty().MaximumLength(100);
        RuleFor(x => x.RentPrice).GreaterThan(0);
        RuleFor(x => x.Rooms).GreaterThan(0);
        RuleFor(x => x.Bathrooms).GreaterThan(0);
        RuleFor(x => x.PropertyType).NotEmpty().MaximumLength(50);
    }
}

public class UpdatePropertyCommandHandler : IRequestHandler<UpdatePropertyCommand, Result>
{
    private readonly IPropertyRepository _repository;

    public UpdatePropertyCommandHandler(IPropertyRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(UpdatePropertyCommand request, CancellationToken cancellationToken)
    {
        var property = await _repository.GetByIdAsync(request.PropertyId, cancellationToken);
        if (property == null)
        {
            throw new NotFoundException($"Property {request.PropertyId} not found.");
        }

        if (property.LandlordId != request.LandlordId)
        {
            throw new ForbiddenException("You are not the owner of this property.");
        }

        property.Title = request.Title;
        property.Description = request.Description;
        property.Address = request.Address;
        property.City = request.City;
        property.State = request.State;
        property.RentPrice = request.RentPrice;
        property.Rooms = request.Rooms;
        property.Bathrooms = request.Bathrooms;
        property.PropertyType = request.PropertyType;

        _repository.Update(property);
        await _repository.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
