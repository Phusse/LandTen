using FluentValidation;
using MediatR;
using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using UserService.Application.Interfaces;

namespace UserService.Application.Commands.ChangePassword;

public record ChangePasswordCommand(Guid UserId, string CurrentPassword, string NewPassword) : IRequest<Result<bool>>;

public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(6);
    }
}

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Result<bool>>
{
    private readonly IUserRepository _userRepository;
    private readonly ISessionRepository _sessionRepository;

    public ChangePasswordCommandHandler(IUserRepository userRepository, ISessionRepository sessionRepository)
    {
        _userRepository = userRepository;
        _sessionRepository = sessionRepository;
    }

    public async Task<Result<bool>> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            // Do not reveal if user exists, although they are authenticated so they should exist.
            throw new BuildingBlocks.Common.Exceptions.ValidationException(new Dictionary<string, string[]> { { "CurrentPassword", new[] { "Current password is incorrect" } } });
        }

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new BuildingBlocks.Common.Exceptions.ValidationException(new Dictionary<string, string[]> { { "CurrentPassword", new[] { "Current password is incorrect" } } });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync(cancellationToken);

        // Invalidate all sessions so they have to login with the new password everywhere
        await _sessionRepository.DeleteAllForUserAsync(user.Id, cancellationToken);
        await _sessionRepository.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
