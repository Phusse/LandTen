namespace BuildingBlocks.Common.Exceptions;

/// <summary>Thrown when a requested resource cannot be found (maps to HTTP 404).</summary>
public class NotFoundException : AppException
{
    public NotFoundException(string entityName, object key)
        : base($"Entity '{entityName}' with identifier '{key}' was not found.") { }

    public NotFoundException(string message) : base(message) { }
}
