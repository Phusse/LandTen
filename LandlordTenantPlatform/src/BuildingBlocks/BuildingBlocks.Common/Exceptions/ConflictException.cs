namespace BuildingBlocks.Common.Exceptions;

/// <summary>
/// Thrown when an operation would create a duplicate or otherwise conflict
/// with existing state (HTTP 409). Examples: duplicate email on registration,
/// submitting a second application for the same property.
/// </summary>
public sealed class ConflictException : AppException
{
    public ConflictException(string message)
        : base(message) { }

    public ConflictException(string resourceName, string conflictDetail)
        : base($"Conflict on '{resourceName}': {conflictDetail}") { }
}
