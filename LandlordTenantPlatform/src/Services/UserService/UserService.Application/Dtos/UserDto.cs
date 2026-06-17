namespace UserService.Application.Dtos;

public record UserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string Role,
    string VerificationStatus,
    DateTime CreatedAt
);
