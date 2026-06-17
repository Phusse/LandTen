namespace BuildingBlocks.EventBus.Events;

// ─────────────────────────────────────────────────────────────────────────────
//  Canonical integration event contracts shared across all services.
//  Services publish these via MassTransit; consumers register handlers in their
//  Infrastructure layer and wire up via AddRabbitMqEventBus(configure: x => ...).
// ─────────────────────────────────────────────────────────────────────────────

/// <summary>Published by UserService when a new user account is created.</summary>
public sealed record UserCreatedEvent(
    Guid UserId,
    string Email) : IntegrationEvent;

/// <summary>Published by UserService after a user's identity or phone is verified.</summary>
public sealed record UserVerifiedEvent(
    Guid UserId) : IntegrationEvent;

/// <summary>Published by PropertyService when a new listing is created.</summary>
public sealed record PropertyCreatedEvent(
    Guid PropertyId,
    Guid LandlordId) : IntegrationEvent;

/// <summary>Published by PropertyService when a property's verification documents are fully approved.</summary>
public sealed record PropertyVerifiedEvent(
    Guid PropertyId,
    Guid LandlordId) : IntegrationEvent;

/// <summary>Published by ApplicationService when a tenant submits a rental application.</summary>
public sealed record ApplicationSubmittedEvent(
    Guid ApplicationId,
    Guid TenantId,
    Guid PropertyId) : IntegrationEvent;

/// <summary>Published by PaymentService after a rent payment is successfully processed.</summary>
public sealed record PaymentCompletedEvent(
    Guid TransactionId,
    Guid UserId,
    decimal Amount) : IntegrationEvent;
