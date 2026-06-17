using FluentValidation;
using MediatR;
using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using PropertyService.Application.Interfaces;
using PropertyService.Domain.Enums;

namespace PropertyService.Application.Commands.UpdatePropertyStatus;

public record UpdatePropertyStatusCommand(Guid PropertyId, Guid LandlordId, PropertyStatus Status) : IRequest<Result>;

public class UpdatePropertyStatusCommandValidator : AbstractValidator<UpdatePropertyStatusCommand>
{
    public UpdatePropertyStatusCommandValidator()
    {
        RuleFor(x => x.PropertyId).NotEmpty();
        RuleFor(x => x.LandlordId).NotEmpty();
        RuleFor(x => x.Status).IsInEnum();
    }
}

public class UpdatePropertyStatusCommandHandler : IRequestHandler<UpdatePropertyStatusCommand, Result>
{
    private readonly IPropertyRepository _repository;

    public UpdatePropertyStatusCommandHandler(IPropertyRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(UpdatePropertyStatusCommand request, CancellationToken cancellationToken)
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

        property.Status = request.Status;

        _repository.Update(property);
        await _repository.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
