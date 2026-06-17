using MediatR;
using FluentValidation;
using BuildingBlocks.Common.Wrappers;
using BuildingBlocks.Common.Exceptions;
using ApplicationEntity = ApplicationService.Domain.Entities.Application;
using ApplicationService.Application.Interfaces;
using BuildingBlocks.EventBus.Events;
using MassTransit;

namespace ApplicationService.Application.Commands.ApplyToProperty;

public record ApplyToPropertyCommand(Guid PropertyId, Guid TenantId) : IRequest<Result<Guid>>;

public class ApplyToPropertyCommandValidator : AbstractValidator<ApplyToPropertyCommand>
{
    public ApplyToPropertyCommandValidator()
    {
        RuleFor(x => x.PropertyId).NotEmpty();
        RuleFor(x => x.TenantId).NotEmpty();
    }
}

public class ApplyToPropertyCommandHandler : IRequestHandler<ApplyToPropertyCommand, Result<Guid>>
{
    private readonly IApplicationRepository _repository;
    private readonly IPropertyServiceClient _propertyServiceClient;
    private readonly IPublishEndpoint _publishEndpoint;

    public ApplyToPropertyCommandHandler(
        IApplicationRepository repository, 
        IPropertyServiceClient propertyServiceClient,
        IPublishEndpoint publishEndpoint)
    {
        _repository = repository;
        _propertyServiceClient = propertyServiceClient;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Result<Guid>> Handle(ApplyToPropertyCommand request, CancellationToken cancellationToken)
    {
        // 1. Check if property exists and is available
        var property = await _propertyServiceClient.GetPropertyAsync(request.PropertyId, cancellationToken);
        if (property == null)
            throw new NotFoundException($"Property {request.PropertyId} not found.");

        if (property.Status != "Available")
            throw new AppException($"Property {request.PropertyId} is not available for rent.");

        // 2. Check if tenant already applied
        var exists = await _repository.ExistsForTenantAndPropertyAsync(request.TenantId, request.PropertyId, cancellationToken);
        if (exists)
            throw new ConflictException("You have already applied to this property.");

        // 3. Create Application
        var application = ApplicationEntity.Create(request.TenantId, request.PropertyId);
        await _repository.AddAsync(application, cancellationToken);

        // 4. Publish Event
        await _publishEndpoint.Publish(new ApplicationSubmittedEvent(application.Id, application.PropertyId, application.TenantId), cancellationToken);

        return Result<Guid>.Success(application.Id);
    }
}
