using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BuildingBlocks.EventBus.Extensions;

/// <summary>
/// DI extensions for wiring MassTransit + RabbitMQ into any *.Api or Worker project.
/// </summary>
public static class MassTransitExtensions
{
    /// <summary>
    /// Registers MassTransit with a RabbitMQ transport, reading connection details from the
    /// <c>RabbitMq</c> configuration section (Host, Username, Password).
    /// </summary>
    /// <param name="services">The service collection to register into.</param>
    /// <param name="configuration">App configuration — reads <c>RabbitMq:Host</c>,
    ///   <c>RabbitMq:Username</c>, <c>RabbitMq:Password</c>.</param>
    /// <param name="configureConsumers">
    /// Optional delegate for registering service-specific consumers, sagas, or activities.
    /// Example:
    /// <code>
    /// services.AddRabbitMqEventBus(config, x =>
    /// {
    ///     x.AddConsumer&lt;UserCreatedEventConsumer&gt;();
    /// });
    /// </code>
    /// </param>
    /// <returns>The <paramref name="services"/> for chaining.</returns>
    public static IServiceCollection AddRabbitMqEventBus(
        this IServiceCollection services,
        IConfiguration configuration,
        Action<IBusRegistrationConfigurator>? configureConsumers = null)
    {
        services.AddMassTransit(x =>
        {
            // Let each service register its own consumers via the delegate.
            configureConsumers?.Invoke(x);

            x.UsingRabbitMq((ctx, cfg) =>
            {
                var host     = configuration["RabbitMq:Host"]     ?? "localhost";
                var username = configuration["RabbitMq:Username"] ?? "guest";
                var password = configuration["RabbitMq:Password"] ?? "guest";

                cfg.Host(host, h =>
                {
                    h.Username(username);
                    h.Password(password);
                });

                // Auto-configure endpoints for all registered consumers.
                cfg.ConfigureEndpoints(ctx);
            });
        });

        return services;
    }
}
