using BuildingBlocks.EventBus.Extensions;
using MassTransit;
using NotificationService.Worker.Consumers;
using NotificationService.Worker.Services;
using NotificationService.Worker.Clients;

var builder = Host.CreateApplicationBuilder(args);

// Register Notification Sender
builder.Services.AddSingleton<INotificationSender, ConsoleNotificationSender>();

// Register HttpClients
builder.Services.AddHttpClient<IPropertyServiceClient, PropertyServiceClient>(client => 
{
    client.BaseAddress = new Uri(builder.Configuration["Services:PropertyServiceBaseUrl"] ?? "http://localhost:5002");
});
builder.Services.AddHttpClient<IUserServiceClient, UserServiceClient>(client => 
{
    client.BaseAddress = new Uri(builder.Configuration["Services:UserServiceBaseUrl"] ?? "http://localhost:5001");
});

// Register EventBus & Consumers
builder.Services.AddRabbitMqEventBus(builder.Configuration, x =>
{
    x.AddConsumer<UserCreatedEventConsumer>();
    x.AddConsumer<UserVerifiedEventConsumer>();
    x.AddConsumer<ApplicationSubmittedEventConsumer>();
    x.AddConsumer<PaymentCompletedEventConsumer>();
});

var host = builder.Build();
host.Run();
