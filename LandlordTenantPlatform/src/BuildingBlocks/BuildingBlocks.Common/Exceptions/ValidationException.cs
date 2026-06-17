namespace BuildingBlocks.Common.Exceptions;

/// <summary>Thrown when FluentValidation pipeline detects invalid input (maps to HTTP 422).</summary>
public class ValidationException : AppException
{
    public IReadOnlyDictionary<string, string[]> Errors { get; }

    public ValidationException(IReadOnlyDictionary<string, string[]> errors)
        : base("One or more validation failures occurred.")
    {
        Errors = errors;
    }
}
