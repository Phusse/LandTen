using MediatR;
using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using UserService.Application.Interfaces;
using UserService.Domain.Enums;
using UserService.Domain.Entities;

namespace UserService.Application.Commands.Admin.ReactivateUser;

public record ReactivateUserCommand(Guid TargetUserId, Guid AdminId, string? Reason) : IRequest<Result<bool>>;

public class ReactivateUserCommandHandler : IRequestHandler<ReactivateUserCommand, Result<bool>>
{
    private readonly IUserRepository _userRepository;
    private readonly IAdminActionLogRepository _adminActionLogRepository;

    public ReactivateUserCommandHandler(IUserRepository userRepository, IAdminActionLogRepository adminActionLogRepository)
    {
        _userRepository = userRepository;
        _adminActionLogRepository = adminActionLogRepository;
    }

    public async Task<Result<bool>> Handle(ReactivateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.TargetUserId, cancellationToken);
        if (user == null)
            throw new NotFoundException($"User {request.TargetUserId} not found.");

        user.Status = UserStatus.Active;
        _userRepository.Update(user);

        var log = new AdminActionLog
        {
            TargetUserId = request.TargetUserId,
            Action = "Reactivate",
            Reason = request.Reason,
            PerformedBy = request.AdminId
        };
        await _adminActionLogRepository.AddAsync(log);

        await _userRepository.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
