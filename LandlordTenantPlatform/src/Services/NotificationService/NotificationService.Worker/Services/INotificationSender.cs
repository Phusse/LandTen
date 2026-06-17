namespace NotificationService.Worker.Services;

public interface INotificationSender
{
    Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default);
    Task SendSmsAsync(string to, string message, CancellationToken cancellationToken = default);
}
