using System.Text;
using BuildingBlocks.Auth;
using BuildingBlocks.Auth.Handlers;
using BuildingBlocks.Auth.Models;
using BuildingBlocks.Auth.Requirements;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace BuildingBlocks.Auth.Extensions;

/// <summary>
/// Shared JWT authentication and role-based authorization registration.
/// Call <see cref="AddJwtAuthentication"/> from every *.Api Program.cs.
/// </summary>
public static class AuthExtensions
{
    // ─────────────────────────────────────────────────────────────────────────
    //  Authentication
    // ─────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Adds JWT bearer authentication, registers <see cref="JwtSettings"/> as options,
    /// and wires all role-based authorization policies (via <see cref="AddRolePolicies"/>).
    /// The handler for the custom <c>VerifiedLandlordOnly</c> policy is also registered.
    /// </summary>
    /// <remarks>
    /// Reads from the <c>Jwt</c> config section:
    /// <c>Issuer</c>, <c>Audience</c>, <c>SecretKey</c>,
    /// <c>AccessTokenExpiryMinutes</c>, <c>RefreshTokenExpiryDays</c>.
    /// </remarks>
    public static IServiceCollection AddJwtAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var jwtSettings = configuration
            .GetSection(JwtSettings.SectionName)
            .Get<JwtSettings>()
            ?? throw new InvalidOperationException(
                $"Missing configuration section '{JwtSettings.SectionName}'. " +
                "Ensure appsettings.json or environment variables contain Jwt:Issuer, " +
                "Jwt:Audience and Jwt:SecretKey.");

        // Bind as strongly-typed options so services can inject IOptions<JwtSettings>
        services.Configure<JwtSettings>(
            configuration.GetSection(JwtSettings.SectionName));

        services
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer           = true,
                    ValidateAudience         = true,
                    ValidateLifetime         = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer              = jwtSettings.Issuer,
                    ValidAudience            = jwtSettings.Audience,
                    IssuerSigningKey         = new SymmetricSecurityKey(
                                                   Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
                    // Zero clock skew — tokens expire exactly at expiry time.
                    ClockSkew                = TimeSpan.Zero
                };
            });

        // Authorization — policies + custom requirement handler
        services.AddAuthorization(options => options.AddRolePolicies());
        services.AddSingleton<IAuthorizationHandler, VerifiedLandlordHandler>();

        return services;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Authorization policies
    // ─────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Registers the platform's four role-based authorization policies onto
    /// <paramref name="options"/>. Can be called standalone if you need to add
    /// further policies in the same <c>AddAuthorization</c> block.
    /// </summary>
    /// <remarks>
    /// Policies defined:
    /// <list type="bullet">
    ///   <item><description><b>TenantOnly</b> — <c>role</c> claim == <c>"tenant"</c></description></item>
    ///   <item><description><b>LandlordOnly</b> — <c>role</c> claim == <c>"landlord"</c></description></item>
    ///   <item><description><b>AdminOnly</b> — <c>role</c> claim == <c>"admin"</c></description></item>
    ///   <item><description><b>VerifiedLandlordOnly</b> — <c>role == "landlord"</c> AND
    ///     <c>verification_status == "verified"</c> (evaluated by
    ///     <see cref="VerifiedLandlordHandler"/>)</description></item>
    /// </list>
    /// </remarks>
    public static AuthorizationOptions AddRolePolicies(this AuthorizationOptions options)
    {
        options.AddPolicy(AuthPolicies.TenantOnly,
            policy => policy.RequireAssertion(context => 
                context.User.HasClaim(c => (c.Type == System.Security.Claims.ClaimTypes.Role || c.Type == "role") && (c.Value == "tenant" || c.Value == "admin"))));

        options.AddPolicy(AuthPolicies.LandlordOnly,
            policy => policy.RequireAssertion(context => 
                context.User.HasClaim(c => (c.Type == System.Security.Claims.ClaimTypes.Role || c.Type == "role") && (c.Value == "landlord" || c.Value == "admin"))));

        options.AddPolicy(AuthPolicies.AdminOnly,
            policy => policy.RequireAssertion(context => 
                context.User.HasClaim(c => (c.Type == System.Security.Claims.ClaimTypes.Role || c.Type == "role") && c.Value == "admin")));

        options.AddPolicy(AuthPolicies.VerifiedLandlordOnly,
            policy => policy
                .RequireAuthenticatedUser()
                .AddRequirements(new VerifiedLandlordRequirement()));

        return options;
    }
}
