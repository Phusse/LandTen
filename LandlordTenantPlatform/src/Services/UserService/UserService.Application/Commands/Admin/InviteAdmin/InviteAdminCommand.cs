using BuildingBlocks.Common.Wrappers;
using MediatR;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;
using UserService.Domain.Enums;

namespace UserService.Application.Commands.Admin.InviteAdmin;

public record InviteAdminCommand(
    string Email,
    string FirstName,
    string LastName,
    string TemporaryPassword,
    Guid InvitedByAdminId) : IRequest<Result<Guid>>;

public class InviteAdminCommandHandler : IRequestHandler<InviteAdminCommand, Result<Guid>>
{
    private readonly IUserRepository _userRepository;

    public InviteAdminCommandHandler(
        IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<Guid>> Handle(InviteAdminCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return Result<Guid>.Failure("A user with this email already exists.");
        }

        var newUser = new User(request.Email, "", "", UserRole.Admin);

        newUser.UserProfile = new UserProfile
        {
            FirstName = request.FirstName,
            LastName = request.LastName
        };

        newUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.TemporaryPassword);

        await _userRepository.AddAsync(newUser);
        await _userRepository.SaveChangesAsync(cancellationToken);

        // Here we would typically send an email with the temporary password
        // For now, it will just successfully create the user.

        return Result<Guid>.Success(newUser.Id);
    }
}
