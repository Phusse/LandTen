using MediatR;
using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using UserService.Application.Interfaces;

namespace UserService.Application.Queries.GetMyProfile;

public record MyProfileDto(
    Guid Id,
    string Email,
    string Phone,
    string FirstName,
    string LastName,
    string? AvatarUrl,
    string Role,
    string VerificationStatus,
    DateTime CreatedAt
);

public record GetMyProfileQuery(Guid UserId) : IRequest<Result<MyProfileDto>>;

public class GetMyProfileQueryHandler : IRequestHandler<GetMyProfileQuery, Result<MyProfileDto>>
{
    private readonly IUserRepository _userRepository;

    public GetMyProfileQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<MyProfileDto>> Handle(GetMyProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
            throw new NotFoundException($"User {request.UserId} not found.");

        var dto = new MyProfileDto(
            user.Id,
            user.Email,
            user.Phone,
            user.UserProfile?.FirstName ?? string.Empty,
            user.UserProfile?.LastName ?? string.Empty,
            user.UserProfile?.AvatarUrl,
            user.Role.ToString(),
            user.VerificationStatus.ToString(),
            user.CreatedAt
        );

        return Result<MyProfileDto>.Success(dto);
    }
}
