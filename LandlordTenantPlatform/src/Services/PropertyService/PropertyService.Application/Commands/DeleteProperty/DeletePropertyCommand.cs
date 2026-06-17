using MediatR;
using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using PropertyService.Application.Interfaces;

namespace PropertyService.Application.Commands.DeleteProperty;

public record DeletePropertyCommand(Guid PropertyId, Guid LandlordId) : IRequest<Result>;

public class DeletePropertyCommandHandler : IRequestHandler<DeletePropertyCommand, Result>
{
    private readonly IPropertyRepository _repository;

    public DeletePropertyCommandHandler(IPropertyRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(DeletePropertyCommand request, CancellationToken cancellationToken)
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

        _repository.Delete(property);
        await _repository.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
