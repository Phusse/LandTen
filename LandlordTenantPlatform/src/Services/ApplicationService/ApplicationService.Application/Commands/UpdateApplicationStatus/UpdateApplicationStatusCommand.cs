using MediatR;
using FluentValidation;
using BuildingBlocks.Common.Wrappers;
using BuildingBlocks.Common.Exceptions;
using ApplicationService.Domain.Enums;
using ApplicationService.Application.Interfaces;

namespace ApplicationService.Application.Commands.UpdateApplicationStatus;

public record UpdateApplicationStatusCommand(Guid ApplicationId, ApplicationStatus NewStatus, Guid LandlordId) : IRequest<Result<bool>>;

public class UpdateApplicationStatusCommandValidator : AbstractValidator<UpdateApplicationStatusCommand>
{
    public UpdateApplicationStatusCommandValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
        RuleFor(x => x.NewStatus).IsInEnum();
        RuleFor(x => x.LandlordId).NotEmpty();
    }
}

public class UpdateApplicationStatusCommandHandler : IRequestHandler<UpdateApplicationStatusCommand, Result<bool>>
{
    private readonly IApplicationRepository _repository;
    private readonly IPropertyServiceClient _propertyServiceClient;

    public UpdateApplicationStatusCommandHandler(IApplicationRepository repository, IPropertyServiceClient propertyServiceClient)
    {
        _repository = repository;
        _propertyServiceClient = propertyServiceClient;
    }

    public async Task<Result<bool>> Handle(UpdateApplicationStatusCommand request, CancellationToken cancellationToken)
    {
        var application = await _repository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (application == null)
            throw new NotFoundException($"Application {request.ApplicationId} not found.");

        // Check ownership
        var property = await _propertyServiceClient.GetPropertyAsync(application.PropertyId, cancellationToken);
        if (property == null || property.LandlordId != request.LandlordId)
        {
            throw new ForbiddenException("You are not authorized to update this application.");
        }

        application.UpdateStatus(request.NewStatus);
        await _repository.UpdateAsync(application, cancellationToken);

        return Result<bool>.Success(true);
    }
}
