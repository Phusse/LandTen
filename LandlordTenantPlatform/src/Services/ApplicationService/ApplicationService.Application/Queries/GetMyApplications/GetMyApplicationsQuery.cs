using MediatR;
using BuildingBlocks.Common.Wrappers;
using ApplicationService.Application.Interfaces;

namespace ApplicationService.Application.Queries.GetMyApplications;

public record ApplicationDto(Guid Id, Guid PropertyId, Guid TenantId, string Status, DateTime? InspectionDate, DateTime CreatedAt);

public record GetMyApplicationsQuery(Guid CallerId, string CallerRole) : IRequest<Result<List<ApplicationDto>>>;

public class GetMyApplicationsQueryHandler : IRequestHandler<GetMyApplicationsQuery, Result<List<ApplicationDto>>>
{
    private readonly IApplicationRepository _repository;
    private readonly IPropertyServiceClient _propertyServiceClient;

    public GetMyApplicationsQueryHandler(IApplicationRepository repository, IPropertyServiceClient propertyServiceClient)
    {
        _repository = repository;
        _propertyServiceClient = propertyServiceClient;
    }

    public async Task<Result<List<ApplicationDto>>> Handle(GetMyApplicationsQuery request, CancellationToken cancellationToken)
    {
        if (request.CallerRole.Equals("tenant", StringComparison.OrdinalIgnoreCase))
        {
            var apps = await _repository.GetByTenantIdAsync(request.CallerId, cancellationToken);
            var dtos = apps.Select(a => new ApplicationDto(a.Id, a.PropertyId, a.TenantId, a.Status.ToString(), a.InspectionDate, a.CreatedAt)).ToList();
            return Result<List<ApplicationDto>>.Success(dtos);
        }
        else if (request.CallerRole.Equals("landlord", StringComparison.OrdinalIgnoreCase))
        {
            // Get all property IDs owned by this landlord
            var propertyIds = await _propertyServiceClient.GetPropertiesByLandlordAsync(request.CallerId, cancellationToken);
            
            if (!propertyIds.Any()) 
                return Result<List<ApplicationDto>>.Success(new List<ApplicationDto>());

            var apps = await _repository.GetByPropertyIdsAsync(propertyIds, cancellationToken);
            var dtos = apps.Select(a => new ApplicationDto(a.Id, a.PropertyId, a.TenantId, a.Status.ToString(), a.InspectionDate, a.CreatedAt)).ToList();
            return Result<List<ApplicationDto>>.Success(dtos);
        }

        return Result<List<ApplicationDto>>.Success(new List<ApplicationDto>());
    }
}
