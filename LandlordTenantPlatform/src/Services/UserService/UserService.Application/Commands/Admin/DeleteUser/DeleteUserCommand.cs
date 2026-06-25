using MediatR;
using BuildingBlocks.Common.Wrappers;
using UserService.Application.Interfaces;
using UserService.Domain.Enums;

namespace UserService.Application.Commands.Admin.DeleteUser;

public record DeleteUserCommand(Guid UserId, Guid AdminId, string? Reason) : IRequest<Result<Unit>>;

public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, Result<Unit>>
{
    private readonly IUserRepository _userRepository;

    public DeleteUserCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<Unit>> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId);
        if (user == null)
            return Result<Unit>.Failure("User not found.");

        if (user.Role == UserRole.SuperAdmin)
            return Result<Unit>.Failure("SuperAdmin accounts cannot be deleted.");

        user.SoftDelete();
        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
