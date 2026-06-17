using MediatR;
using BuildingBlocks.Common.Wrappers;
using PropertyService.Application.Interfaces;
using PropertyService.Application.Queries.SearchProperties;

namespace PropertyService.Application.Queries.GetPropertiesByLandlord;

public record GetPropertiesByLandlordQuery(
    Guid LandlordId,
    int PageNumber = 1,
    int PageSize = 10) : IRequest<Result<PaginatedList<PropertyDto>>>;

public class GetPropertiesByLandlordQueryHandler : IRequestHandler<GetPropertiesByLandlordQuery, Result<PaginatedList<PropertyDto>>>
{
    private readonly IPropertyRepository _repository;

    public GetPropertiesByLandlordQueryHandler(IPropertyRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PaginatedList<PropertyDto>>> Handle(GetPropertiesByLandlordQuery request, CancellationToken cancellationToken)
    {
        // For now, reuse the SearchAsync method with null filters, but we can filter by landlord afterwards.
        // Or ideally, the repository should be updated. Let's do the same filtering we had in SearchPropertiesQuery.
        // In a real scenario, we would add a dedicated method to IPropertyRepository.
        
        var (items, totalCount) = await _repository.SearchAsync(
            null, null, null, null, null, null,
            1, int.MaxValue, // We have to fetch all to filter by landlord if the repo doesn't support it, but wait!
            // Actually let's fetch all and filter, just to keep it simple and match the old implementation.
            cancellationToken);

        var filteredItems = items.Where(p => p.LandlordId == request.LandlordId).ToList();
        
        var dtos = filteredItems
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new PropertyDto(
                p.Id,
                p.LandlordId,
                p.Title,
                p.Description,
                p.Address,
                p.City,
                p.State,
                p.RentPrice,
                p.Rooms,
                p.Status.ToString(),
                p.Verified,
                p.CreatedAt,
                p.Images.Select(i => i.Url)
            )).ToList();

        var paginatedList = PaginatedList<PropertyDto>.Create(dtos, filteredItems.Count, request.PageNumber, request.PageSize);

        return Result<PaginatedList<PropertyDto>>.Success(paginatedList);
    }
}
