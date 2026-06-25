using BuildingBlocks.Common.Wrappers;
using MediatR;
using PropertyService.Application.Interfaces;

namespace PropertyService.Application.Queries.GetAllPropertyVerifications;

public record PropertyVerificationDto(
    Guid PropertyId,
    string Title,
    string Address,
    Guid LandlordId,
    string Status,
    DateTime CreatedAt,
    List<PropertyDocumentDto> Documents);

public record PropertyDocumentDto(
    Guid DocumentId,
    string DocumentType,
    string FileUrl,
    string Status,
    DateTime CreatedAt);

public record GetAllPropertyVerificationsQuery(string? Status) : IRequest<Result<IEnumerable<PropertyVerificationDto>>>;

public class GetAllPropertyVerificationsQueryHandler : IRequestHandler<GetAllPropertyVerificationsQuery, Result<IEnumerable<PropertyVerificationDto>>>
{
    private readonly IPropertyRepository _propertyRepository;

    public GetAllPropertyVerificationsQueryHandler(IPropertyRepository propertyRepository)
    {
        _propertyRepository = propertyRepository;
    }

    public async Task<Result<IEnumerable<PropertyVerificationDto>>> Handle(GetAllPropertyVerificationsQuery request, CancellationToken cancellationToken)
    {
        PropertyService.Domain.Enums.PropertyDocumentStatus? statusFilter = null;
        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<PropertyService.Domain.Enums.PropertyDocumentStatus>(request.Status, true, out var parsed))
        {
            statusFilter = parsed;
        }

        var docs = await _propertyRepository.GetPropertyDocumentsAsync(statusFilter, cancellationToken);

        // Group by property
        var grouped = docs.GroupBy(d => d.Property);

        var dtos = grouped.Select(g => new PropertyVerificationDto(
            g.Key.Id,
            g.Key.Title,
            g.Key.Address,
            g.Key.LandlordId,
            g.FirstOrDefault()?.Status.ToString() ?? "Unknown",
            g.Key.CreatedAt,
            g.Select(d => new PropertyDocumentDto(d.Id, d.DocumentType, d.FileUrl, d.Status.ToString(), d.CreatedAt)).ToList()
        ));

        return Result<IEnumerable<PropertyVerificationDto>>.Success(dtos);
    }
}
