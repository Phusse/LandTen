using MediatR;
using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using PropertyService.Application.Interfaces;
using PropertyService.Application.Queries.SearchProperties;

namespace PropertyService.Application.Queries.GetPropertyById;

public record GetPropertyByIdQuery(Guid PropertyId) : IRequest<Result<PropertyDto>>;

public class GetPropertyByIdQueryHandler : IRequestHandler<GetPropertyByIdQuery, Result<PropertyDto>>
{
    private readonly IPropertyRepository _repository;

    public GetPropertyByIdQueryHandler(IPropertyRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PropertyDto>> Handle(GetPropertyByIdQuery request, CancellationToken cancellationToken)
    {
        var property = await _repository.GetByIdWithImagesAsync(request.PropertyId, cancellationToken);
        
        if (property == null)
        {
            throw new NotFoundException($"Property {request.PropertyId} not found.");
        }

        var dto = new PropertyDto(
            property.Id,
            property.LandlordId,
            property.Title,
            property.Description,
            property.Address,
            property.City,
            property.State,
            property.RentPrice,
            property.Rooms,
            property.Status.ToString(),
            property.Verified,
            property.CreatedAt,
            property.Images.Select(i => i.Url)
        );

        return Result<PropertyDto>.Success(dto);
    }
}
