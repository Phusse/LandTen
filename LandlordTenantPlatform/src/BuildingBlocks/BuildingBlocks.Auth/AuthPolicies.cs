namespace BuildingBlocks.Auth;

/// <summary>
/// Centralised policy name constants — avoids magic strings scattered across controllers.
/// Reference these in <c>[Authorize(Policy = AuthPolicies.TenantOnly)]</c> attributes.
/// </summary>
public static class AuthPolicies
{
    public const string TenantOnly           = "TenantOnly";
    public const string LandlordOnly         = "LandlordOnly";
    public const string AdminOnly            = "AdminOnly";
    public const string SuperAdminOnly       = "SuperAdminOnly";
    public const string VerifiedLandlordOnly = "VerifiedLandlordOnly";
    public const string VerifiedTenantOnly   = "VerifiedTenantOnly";
    public const string VerifiedUserOnly     = "VerifiedUserOnly";
}
