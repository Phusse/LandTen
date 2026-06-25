using MediatR;
using BuildingBlocks.Common.Wrappers;
using UserService.Application.Interfaces;
using UserService.Domain.Enums;

namespace UserService.Application.Commands.Admin.AssignRole;

public record AssignRoleCommand(Guid UserId, Guid AdminId, UserRole Role) : IRequest<Result<Unit>>;

public class AssignRoleCommandHandler : IRequestHandler<AssignRoleCommand, Result<Unit>>
{
    private readonly IUserRepository _userRepository;

    public AssignRoleCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<Unit>> Handle(AssignRoleCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId);
        if (user == null)
            return Result<Unit>.Failure("User not found.");

        user.AssignRole(request.Role);
        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
