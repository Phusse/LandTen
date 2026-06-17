using MediatR;
using BuildingBlocks.Common.Wrappers;
using UserService.Application.Interfaces;

namespace UserService.Application.Queries.Admin.GetUsers;

public record AdminUserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string Role,
    string VerificationStatus,
    string Status,
    DateTime CreatedAt
);

public record GetUsersQuery(int PageNumber = 1, int PageSize = 10, string? Search = null) : IRequest<Result<PagedResult<AdminUserDto>>>;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, Result<PagedResult<AdminUserDto>>>
{
    private readonly IUserRepository _userRepository;

    public GetUsersQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<PagedResult<AdminUserDto>>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var result = await _userRepository.GetPaginatedUsersAsync(request.PageNumber, request.PageSize, request.Search, cancellationToken);
        var users = result.Users.Select(u => new AdminUserDto(
                u.Id,
                u.Email,
                u.UserProfile != null ? u.UserProfile.FirstName : string.Empty,
                u.UserProfile != null ? u.UserProfile.LastName : string.Empty,
                u.Role.ToString(),
                u.VerificationStatus.ToString(),
                u.Status.ToString(),
                u.CreatedAt
            )).ToList();

        var pagedResult = PagedResult<AdminUserDto>.Create(users, result.TotalCount, request.PageNumber, request.PageSize);
        return Result<PagedResult<AdminUserDto>>.Success(pagedResult);
    }
}
