using MediatR;
using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using UserService.Application.Interfaces;
using UserService.Domain.Enums;

namespace UserService.Application.Queries.GetPublicLandlordProfile;

public record PublicLandlordProfileDto(
    string FirstName,
    string LastName,
    string? AvatarUrl,
    bool IsVerified,
    string MemberSince
);

public record GetPublicLandlordProfileQuery(Guid LandlordId) : IRequest<Result<PublicLandlordProfileDto>>;

public class GetPublicLandlordProfileQueryHandler : IRequestHandler<GetPublicLandlordProfileQuery, Result<PublicLandlordProfileDto>>
{
    private readonly IUserRepository _userRepository;

    public GetPublicLandlordProfileQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<PublicLandlordProfileDto>> Handle(GetPublicLandlordProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.LandlordId, cancellationToken);
        if (user == null || user.Role != UserRole.Landlord)
            throw new NotFoundException($"Landlord {request.LandlordId} not found.");

        // Do not expose "Rejected", just "Verified: true/false"
        var isVerified = user.VerificationStatus == VerificationStatus.Verified;

        // "Member since" - just year/month
        var memberSince = user.CreatedAt.ToString("MMMM yyyy");

        var dto = new PublicLandlordProfileDto(
            user.UserProfile?.FirstName ?? string.Empty,
            user.UserProfile?.LastName ?? string.Empty,
            user.UserProfile?.AvatarUrl,
            isVerified,
            memberSince
        );

        return Result<PublicLandlordProfileDto>.Success(dto);
    }
}
