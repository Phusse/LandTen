using MediatR;
using BuildingBlocks.Common.Wrappers;
using PropertyService.Application.Interfaces;

namespace PropertyService.Application.Queries.SearchProperties;

public record PropertyDto(
    Guid Id,
    Guid LandlordId,
    string Title,
    string Description,
    string Address,
    string City,
    string State,
    decimal RentPrice,
    int Rooms,
    string Status,
    bool Verified,
    DateTime CreatedAt,
    IEnumerable<string> ImageUrls);

public record SearchPropertiesQuery(
    string? City,
    string? State,
    decimal? MinRent,
    decimal? MaxRent,
    int? MinRooms,
    string? Status,
    int PageNumber = 1,
    int PageSize = 10) : IRequest<Result<PaginatedList<PropertyDto>>>;

public class SearchPropertiesQueryHandler : IRequestHandler<SearchPropertiesQuery, Result<PaginatedList<PropertyDto>>>
{
    private readonly IPropertyRepository _repository;

    public SearchPropertiesQueryHandler(IPropertyRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PaginatedList<PropertyDto>>> Handle(SearchPropertiesQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _repository.SearchAsync(
            request.City,
            request.State,
            request.MinRent,
            request.MaxRent,
            request.MinRooms,
            request.Status,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var dtos = items.Select(p => new PropertyDto(
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

        var paginatedList = PaginatedList<PropertyDto>.Create(dtos, totalCount, request.PageNumber, request.PageSize);

        return Result<PaginatedList<PropertyDto>>.Success(paginatedList);
    }
}
