using BuildingBlocks.Auth.Requirements;
using Microsoft.AspNetCore.Authorization;

namespace BuildingBlocks.Auth.Handlers;

/// <summary>
/// Handles the <see cref="VerifiedLandlordRequirement"/>.
/// Succeeds only when both of the following JWT claims are present and valid:
/// <list type="bullet">
///   <item><description><c>role</c> == <c>"landlord"</c></description></item>
///   <item><description><c>verification_status</c> == <c>"verified"</c></description></item>
/// </list>
/// </summary>
public sealed class VerifiedLandlordHandler
    : AuthorizationHandler<VerifiedLandlordRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        VerifiedLandlordRequirement requirement)
    {
        var role               = context.User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var verificationStatus = context.User.FindFirst("verification_status")?.Value;

        if (role == "landlord" && verificationStatus == "verified")
            context.Succeed(requirement);

        return Task.CompletedTask;
    }
}
