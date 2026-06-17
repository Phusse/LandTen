namespace NotificationService.Worker.Services;

public class ConsoleNotificationSender : INotificationSender
{
    private readonly ILogger<ConsoleNotificationSender> _logger;

    public ConsoleNotificationSender(ILogger<ConsoleNotificationSender> logger)
    {
        _logger = logger;
    }

    public Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("--- SIMULATED EMAIL ---");
        _logger.LogInformation("To: {To}", to);
        _logger.LogInformation("Subject: {Subject}", subject);
        _logger.LogInformation("Body: {Body}", body);
        _logger.LogInformation("-----------------------");
        return Task.CompletedTask;
    }

    public Task SendSmsAsync(string to, string message, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("--- SIMULATED SMS ---");
        _logger.LogInformation("To: {To}", to);
        _logger.LogInformation("Message: {Message}", message);
        _logger.LogInformation("---------------------");
        return Task.CompletedTask;
    }
}
