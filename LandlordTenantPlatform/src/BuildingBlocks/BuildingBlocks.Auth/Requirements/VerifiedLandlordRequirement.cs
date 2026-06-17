using Microsoft.AspNetCore.Authorization;

namespace BuildingBlocks.Auth.Requirements;

/// <summary>
/// Custom authorization requirement that passes only when the authenticated user
/// holds the <c>role = "landlord"</c> claim AND a <c>verification_status = "verified"</c> claim.
/// Evaluated by <see cref="BuildingBlocks.Auth.Handlers.VerifiedLandlordHandler"/>.
/// </summary>
public sealed class VerifiedLandlordRequirement : IAuthorizationRequirement { }
