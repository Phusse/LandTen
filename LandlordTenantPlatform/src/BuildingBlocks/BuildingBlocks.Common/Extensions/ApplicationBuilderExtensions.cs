using BuildingBlocks.Common.Middleware;
using Microsoft.AspNetCore.Builder;

namespace BuildingBlocks.Common.Extensions;

/// <summary>
/// Extension methods on <see cref="IApplicationBuilder"/> for BuildingBlocks.Common middleware.
/// </summary>
public static class ApplicationBuilderExtensions
{
    /// <summary>
    /// Adds the global exception handling middleware to the pipeline.
    /// Maps <see cref="BuildingBlocks.Common.Exceptions.NotFoundException"/>,
    /// <see cref="BuildingBlocks.Common.Exceptions.ValidationException"/>,
    /// <see cref="BuildingBlocks.Common.Exceptions.ForbiddenException"/> and
    /// <see cref="BuildingBlocks.Common.Exceptions.ConflictException"/> to the appropriate
    /// RFC 7807 ProblemDetails HTTP responses.
    /// </summary>
    /// <remarks>
    /// Call this before <c>UseAuthentication</c> and <c>UseAuthorization</c> so that
    /// all pipeline exceptions are captured.
    /// <code>
    /// app.UseGlobalExceptionHandling();
    /// app.UseAuthentication();
    /// app.UseAuthorization();
    /// </code>
    /// </remarks>
    public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder app)
        => app.UseMiddleware<GlobalExceptionHandlingMiddleware>();
}
