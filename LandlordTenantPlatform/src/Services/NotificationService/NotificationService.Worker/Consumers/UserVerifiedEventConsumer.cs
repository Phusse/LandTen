using BuildingBlocks.EventBus.Events;
using MassTransit;
using NotificationService.Worker.Services;

namespace NotificationService.Worker.Consumers;

public class UserVerifiedEventConsumer : IConsumer<UserVerifiedEvent>
{
    private readonly INotificationSender _notificationSender;

    public UserVerifiedEventConsumer(INotificationSender notificationSender)
    {
        _notificationSender = notificationSender;
    }

    public async Task Consume(ConsumeContext<UserVerifiedEvent> context)
    {
        var message = context.Message;
        
        // Note: Ideally we look up the user's email/phone based on UserId.
        // For now, we will simulate the notification with a placeholder email.
        var email = $"user_{message.UserId}@example.com";
        var subject = "Your Account is Verified!";
        var body = "Congratulations! Your identity and phone number have been successfully verified. You can now use all platform features.";
        
        await _notificationSender.SendEmailAsync(email, subject, body);
        
        // Optionally send an SMS
        // await _notificationSender.SendSmsAsync("+1234567890", "Your account is now verified on LandTen!");
    }
}
