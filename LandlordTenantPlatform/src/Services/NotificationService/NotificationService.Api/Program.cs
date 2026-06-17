using BuildingBlocks.EventBus.Extensions;

// NotificationService is a Worker Service — no HTTP host.
// It subscribes to RabbitMQ integration events and dispatches notifications.

var builder = Host.CreateApplicationBuilder(args);

// ── Event Bus (MassTransit + RabbitMQ) ───────────────────────────────────
// Register notification consumers here in the next sprint:
// builder.Services.AddEventBus(builder.Configuration, x => x.AddConsumer<UserCreatedNotificationConsumer>());
builder.Services.AddRabbitMqEventBus(builder.Configuration);

// ── Worker ────────────────────────────────────────────────────────────────
// builder.Services.AddHostedService<NotificationWorker>();

var host = builder.Build();
await host.RunAsync();
