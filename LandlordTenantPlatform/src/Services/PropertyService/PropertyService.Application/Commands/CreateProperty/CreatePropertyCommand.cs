using FluentValidation;
using MediatR;
using MassTransit;
using BuildingBlocks.Common.Wrappers;
using BuildingBlocks.EventBus.Events;
using PropertyService.Application.Interfaces;
using PropertyService.Domain.Entities;

namespace PropertyService.Application.Commands.CreateProperty;

public record CreatePropertyResult(Guid PropertyId);

public record CreatePropertyCommand(
    Guid LandlordId,
    string Title,
    string Description,
    string Address,
    string City,
    string State,
    decimal RentPrice,
    int Rooms,
    int Bathrooms,
    string PropertyType) : IRequest<Result<CreatePropertyResult>>;

public class CreatePropertyCommandValidator : AbstractValidator<CreatePropertyCommand>
{
    public CreatePropertyCommandValidator()
    {
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

public class CreatePropertyCommandHandler : IRequestHandler<CreatePropertyCommand, Result<CreatePropertyResult>>
{
    private readonly IPropertyRepository _repository;
    private readonly IPublishEndpoint _publishEndpoint;

    public CreatePropertyCommandHandler(IPropertyRepository repository, IPublishEndpoint publishEndpoint)
    {
        _repository = repository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Result<CreatePropertyResult>> Handle(CreatePropertyCommand request, CancellationToken cancellationToken)
    {
        var property = new Property
        {
            LandlordId = request.LandlordId,
            Title = request.Title,
            Description = request.Description,
            Address = request.Address,
            City = request.City,
            State = request.State,
            RentPrice = request.RentPrice,
            Rooms = request.Rooms,
            Bathrooms = request.Bathrooms,
            PropertyType = request.PropertyType,
            Verified = false
        };

        await _repository.AddAsync(property, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        await _publishEndpoint.Publish(new PropertyCreatedEvent(property.Id, property.LandlordId), cancellationToken);

        return Result<CreatePropertyResult>.Success(new CreatePropertyResult(property.Id));
    }
}
