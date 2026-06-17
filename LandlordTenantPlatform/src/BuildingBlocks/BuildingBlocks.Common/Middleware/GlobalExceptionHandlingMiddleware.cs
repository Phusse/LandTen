using System.Net.Mime;
using BuildingBlocks.Common.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace BuildingBlocks.Common.Middleware;

/// <summary>
/// Catches all unhandled exceptions, logs them, and converts them to RFC 7807
/// <see cref="ProblemDetails"/> JSON responses with consistent status codes.
/// </summary>
/// <remarks>
/// Register via <c>app.UseGlobalExceptionHandling()</c> from
/// <see cref="BuildingBlocks.Common.Extensions.ApplicationBuilderExtensions"/>.
/// Place this middleware early in the pipeline — before authentication — so that
/// errors thrown during authentication are also caught.
/// </remarks>
public sealed class GlobalExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;

    public GlobalExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title) = exception switch
        {
            NotFoundException        => (StatusCodes.Status404NotFound,                "Resource Not Found"),
            ValidationException      => (StatusCodes.Status422UnprocessableEntity,     "Validation Failed"),
            ForbiddenException       => (StatusCodes.Status403Forbidden,               "Forbidden"),
            ConflictException        => (StatusCodes.Status409Conflict,                "Conflict"),
            _                        => (StatusCodes.Status500InternalServerError,     "Internal Server Error")
        };

        // Log 5xx as errors, domain exceptions as warnings (expected failures)
        if (statusCode >= 500)
            _logger.LogError(exception, "Unhandled exception on {Method} {Path}", context.Request.Method, context.Request.Path);
        else
            _logger.LogWarning(exception, "{ExceptionType}: {Message}", exception.GetType().Name, exception.Message);

        var problem = new ProblemDetails
        {
            Status  = statusCode,
            Title   = title,
            Detail  = exception.ToString(),
            Instance = context.Request.Path
        };

        // Attach field-level validation errors for 422 responses
        if (exception is ValidationException ve)
        {
            problem.Extensions["errors"] = ve.Errors;
        }

        context.Response.StatusCode  = statusCode;
        context.Response.ContentType = MediaTypeNames.Application.Json + "; charset=utf-8";
        await context.Response.WriteAsJsonAsync(problem);
    }
}
