using MediatR;
using FluentValidation;
using BuildingBlocks.Common.Wrappers;
using BuildingBlocks.Common.Exceptions;
using ApplicationService.Application.Interfaces;

namespace ApplicationService.Application.Commands.ScheduleInspection;

public record ScheduleInspectionCommand(Guid ApplicationId, DateTime InspectionDate, Guid CallerId, string CallerRole) : IRequest<Result<bool>>;

public class ScheduleInspectionCommandValidator : AbstractValidator<ScheduleInspectionCommand>
{
    public ScheduleInspectionCommandValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
        RuleFor(x => x.InspectionDate).GreaterThan(DateTime.UtcNow).WithMessage("Inspection date must be in the future.");
    }
}

public class ScheduleInspectionCommandHandler : IRequestHandler<ScheduleInspectionCommand, Result<bool>>
{
    private readonly IApplicationRepository _repository;
    private readonly IPropertyServiceClient _propertyServiceClient;

    public ScheduleInspectionCommandHandler(IApplicationRepository repository, IPropertyServiceClient propertyServiceClient)
    {
        _repository = repository;
        _propertyServiceClient = propertyServiceClient;
    }

    public async Task<Result<bool>> Handle(ScheduleInspectionCommand request, CancellationToken cancellationToken)
    {
        var application = await _repository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (application == null)
            throw new NotFoundException($"Application {request.ApplicationId} not found.");

        // Verify participant check (either the tenant or the landlord)
        if (request.CallerRole == "Tenant")
        {
            if (application.TenantId != request.CallerId)
                throw new ForbiddenException("You are not a participant in this application.");
        }
        else if (request.CallerRole == "Landlord")
        {
            var property = await _propertyServiceClient.GetPropertyAsync(application.PropertyId, cancellationToken);
            if (property == null || property.LandlordId != request.CallerId)
                throw new ForbiddenException("You are not authorized to modify this application.");
        }
        else
        {
            throw new ForbiddenException("Invalid role for this action.");
        }

        application.ScheduleInspection(request.InspectionDate);
        await _repository.UpdateAsync(application, cancellationToken);

        return Result<bool>.Success(true);
    }
}
