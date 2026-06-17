namespace BuildingBlocks.Common.Exceptions;

/// <summary>Base exception for all domain/application layer exceptions.</summary>
public class AppException : Exception
{
    public AppException(string message) : base(message) { }
    public AppException(string message, Exception innerException) : base(message, innerException) { }
}
