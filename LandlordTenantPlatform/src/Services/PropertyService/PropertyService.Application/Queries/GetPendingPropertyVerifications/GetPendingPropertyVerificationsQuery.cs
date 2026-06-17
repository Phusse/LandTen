using BuildingBlocks.Common.Wrappers;
using MediatR;
using PropertyService.Application.Interfaces;

namespace PropertyService.Application.Queries.GetPendingPropertyVerifications;

public record PendingPropertyVerificationDto(
    Guid PropertyId,
    string Title,
    string Address,
    Guid LandlordId,
    List<PendingPropertyDocumentDto> Documents);

public record PendingPropertyDocumentDto(
    Guid DocumentId,
    string DocumentType,
    string FileUrl,
    DateTime CreatedAt);

public record GetPendingPropertyVerificationsQuery() : IRequest<Result<IEnumerable<PendingPropertyVerificationDto>>>;

public class GetPendingPropertyVerificationsQueryHandler : IRequestHandler<GetPendingPropertyVerificationsQuery, Result<IEnumerable<PendingPropertyVerificationDto>>>
{
    private readonly IPropertyRepository _propertyRepository;

    public GetPendingPropertyVerificationsQueryHandler(IPropertyRepository propertyRepository)
    {
        _propertyRepository = propertyRepository;
    }

    public async Task<Result<IEnumerable<PendingPropertyVerificationDto>>> Handle(GetPendingPropertyVerificationsQuery request, CancellationToken cancellationToken)
    {
        var pendingDocs = await _propertyRepository.GetPendingPropertyDocumentsAsync(cancellationToken);

        // Group by property
        var grouped = pendingDocs.GroupBy(d => d.Property);

        var dtos = grouped.Select(g => new PendingPropertyVerificationDto(
            g.Key.Id,
            g.Key.Title,
            g.Key.Address,
            g.Key.LandlordId,
            g.Select(d => new PendingPropertyDocumentDto(d.Id, d.DocumentType, d.FileUrl, d.CreatedAt)).ToList()
        ));

        return Result<IEnumerable<PendingPropertyVerificationDto>>.Success(dtos);
    }
}
