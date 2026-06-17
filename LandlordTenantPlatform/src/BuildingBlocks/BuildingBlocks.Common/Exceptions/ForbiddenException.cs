namespace BuildingBlocks.Common.Exceptions;

/// <summary>
/// Thrown when the authenticated user does not have permission to perform an action (HTTP 403).
/// Distinct from authentication failures (401) — the user is known but not authorised.
/// </summary>
public sealed class ForbiddenException : AppException
{
    public ForbiddenException()
        : base("You do not have permission to perform this action.") { }

    public ForbiddenException(string message)
        : base(message) { }
}
