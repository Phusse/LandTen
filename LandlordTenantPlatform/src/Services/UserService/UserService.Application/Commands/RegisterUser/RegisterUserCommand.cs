using FluentValidation;
using MediatR;
using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using BuildingBlocks.EventBus.Events;
using MassTransit;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;
using UserService.Domain.Enums;

using UserService.Application.Dtos;

namespace UserService.Application.Commands.RegisterUser;

public record RegisterUserResult(Guid UserId, bool VerificationRequired, UserDto User);

public record RegisterUserCommand(string Email, string Phone, string Password, string FirstName, string LastName, UserRole Role) : IRequest<Result<RegisterUserResult>>;

public class RegisterUserCommandValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Phone).NotEmpty().MinimumLength(10);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        RuleFor(x => x.FirstName).NotEmpty();
        RuleFor(x => x.LastName).NotEmpty();
        RuleFor(x => x.Role).IsInEnum();
    }
}

public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, Result<RegisterUserResult>>
{
    private readonly IUserRepository _userRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public RegisterUserCommandHandler(IUserRepository userRepository, IPublishEndpoint publishEndpoint)
    {
        _userRepository = userRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Result<RegisterUserResult>> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        var existingEmail = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingEmail != null)
        {
            throw new ConflictException("Email already in use.");
        }

        var existingPhone = await _userRepository.GetByPhoneAsync(request.Phone, cancellationToken);
        if (existingPhone != null)
        {
            throw new ConflictException("Phone already in use.");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User(request.Email, request.Phone, passwordHash, request.Role);
        user.UserProfile = new UserProfile
        {
            UserId = user.Id,
            FirstName = request.FirstName,
            LastName = request.LastName
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _userRepository.SaveChangesAsync(cancellationToken);

        await _publishEndpoint.Publish(new UserCreatedEvent(user.Id, user.Email), cancellationToken);

        var userDto = new UserDto(
            user.Id,
            user.Email,
            user.UserProfile.FirstName,
            user.UserProfile.LastName,
            user.Role.ToString(),
            user.VerificationStatus.ToString(),
            user.CreatedAt
        );

        return Result<RegisterUserResult>.Success(new RegisterUserResult(user.Id, true, userDto));
    }
}
