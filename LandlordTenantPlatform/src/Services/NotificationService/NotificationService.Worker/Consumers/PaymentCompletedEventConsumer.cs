using BuildingBlocks.EventBus.Events;
using MassTransit;
using NotificationService.Worker.Services;

namespace NotificationService.Worker.Consumers;

public class PaymentCompletedEventConsumer : IConsumer<PaymentCompletedEvent>
{
    private readonly INotificationSender _notificationSender;

    public PaymentCompletedEventConsumer(INotificationSender notificationSender)
    {
        _notificationSender = notificationSender;
    }

    public async Task Consume(ConsumeContext<PaymentCompletedEvent> context)
    {
        var message = context.Message;
        
        // Note: Needs lookup for user email based on UserId
        var email = $"user_{message.UserId}@example.com";
        var subject = "Payment Receipt";
        var body = $"Your payment of ${message.Amount} (Tx: {message.TransactionId}) has been successfully processed. Thank you!";
        
        await _notificationSender.SendEmailAsync(email, subject, body);
    }
}
