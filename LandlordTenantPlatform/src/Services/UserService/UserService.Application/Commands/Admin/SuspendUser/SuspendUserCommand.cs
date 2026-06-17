using MediatR;
using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using UserService.Application.Interfaces;
using UserService.Domain.Enums;
using UserService.Domain.Entities;

namespace UserService.Application.Commands.Admin.SuspendUser;

public record SuspendUserCommand(Guid TargetUserId, Guid AdminId, string? Reason) : IRequest<Result<bool>>;

public class SuspendUserCommandHandler : IRequestHandler<SuspendUserCommand, Result<bool>>
{
    private readonly IUserRepository _userRepository;
    private readonly ISessionRepository _sessionRepository;
    private readonly IAdminActionLogRepository _adminActionLogRepository;

    public SuspendUserCommandHandler(IUserRepository userRepository, ISessionRepository sessionRepository, IAdminActionLogRepository adminActionLogRepository)
    {
        _userRepository = userRepository;
        _sessionRepository = sessionRepository;
        _adminActionLogRepository = adminActionLogRepository;
    }

    public async Task<Result<bool>> Handle(SuspendUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.TargetUserId, cancellationToken);
        if (user == null)
            throw new NotFoundException($"User {request.TargetUserId} not found.");

        user.Status = UserStatus.Suspended;
        _userRepository.Update(user);

        var log = new AdminActionLog
        {
            TargetUserId = request.TargetUserId,
            Action = "Suspend",
            Reason = request.Reason,
            PerformedBy = request.AdminId
        };
        await _adminActionLogRepository.AddAsync(log);

        // Delete active sessions
        await _sessionRepository.DeleteAllForUserAsync(user.Id, cancellationToken);

        await _userRepository.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
