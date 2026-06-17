using BuildingBlocks.EventBus.Events;
using MassTransit;
using NotificationService.Worker.Services;

namespace NotificationService.Worker.Consumers;

public class UserCreatedEventConsumer : IConsumer<UserCreatedEvent>
{
    private readonly INotificationSender _notificationSender;

    public UserCreatedEventConsumer(INotificationSender notificationSender)
    {
        _notificationSender = notificationSender;
    }

    public async Task Consume(ConsumeContext<UserCreatedEvent> context)
    {
        var message = context.Message;
        
        var subject = "Welcome to LandTen Platform!";
        var body = $"Hi {message.Email},\n\nThank you for creating an account. Please complete your profile to get started.\n\nThanks,\nLandTen Team";
        
        await _notificationSender.SendEmailAsync(message.Email, subject, body);
    }
}
