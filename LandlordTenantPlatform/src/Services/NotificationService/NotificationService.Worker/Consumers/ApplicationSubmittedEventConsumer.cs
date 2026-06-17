using BuildingBlocks.EventBus.Events;
using MassTransit;
using NotificationService.Worker.Clients;
using NotificationService.Worker.Services;

namespace NotificationService.Worker.Consumers;

public class ApplicationSubmittedEventConsumer : IConsumer<ApplicationSubmittedEvent>
{
    private readonly INotificationSender _notificationSender;
    private readonly IPropertyServiceClient _propertyServiceClient;
    private readonly IUserServiceClient _userServiceClient;
    private readonly ILogger<ApplicationSubmittedEventConsumer> _logger;

    public ApplicationSubmittedEventConsumer(
        INotificationSender notificationSender, 
        IPropertyServiceClient propertyServiceClient,
        IUserServiceClient userServiceClient,
        ILogger<ApplicationSubmittedEventConsumer> logger)
    {
        _notificationSender = notificationSender;
        _propertyServiceClient = propertyServiceClient;
        _userServiceClient = userServiceClient;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ApplicationSubmittedEvent> context)
    {
        var message = context.Message;
        
        _logger.LogInformation("Processing application {ApplicationId} submitted by Tenant {TenantId} for Property {PropertyId}", 
            message.ApplicationId, message.TenantId, message.PropertyId);

        var property = await _propertyServiceClient.GetPropertyAsync(message.PropertyId);
        if (property == null)
        {
            _logger.LogWarning("Could not find property {PropertyId}", message.PropertyId);
            return;
        }

        var landlord = await _userServiceClient.GetUserAsync(property.LandlordId);
        if (landlord == null)
        {
            _logger.LogWarning("Could not find landlord {LandlordId} for property {PropertyId}", property.LandlordId, message.PropertyId);
            return;
        }

        var emailSubject = $"New Application for Property {property.PropertyId}";
        var emailBody = $"Hello {landlord.FirstName}, you have a new application for your property from tenant {message.TenantId}.";
        await _notificationSender.SendEmailAsync(landlord.Email, emailSubject, emailBody);

        _logger.LogInformation("Sent notification to landlord {LandlordId} ({Email})", landlord.Id, landlord.Email);
    }
}
