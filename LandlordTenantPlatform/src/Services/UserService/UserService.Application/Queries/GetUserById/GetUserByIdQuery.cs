using BuildingBlocks.Common.Wrappers;
using MediatR;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;

namespace UserService.Application.Queries.GetUserById;

public record GetUserByIdQuery(Guid UserId) : IRequest<Result<UserDto>>;

public record UserDto(Guid Id, string Email, string FirstName, string LastName, string PhoneNumber, string Role, string Status);

public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, Result<UserDto>>
{
    private readonly IUserRepository _userRepository;

    public GetUserByIdQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<UserDto>> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
            return Result<UserDto>.Failure("User not found");

        var dto = new UserDto(
            user.Id, 
            user.Email, 
            user.UserProfile?.FirstName ?? "", 
            user.UserProfile?.LastName ?? "", 
            user.Phone ?? "", 
            user.Role.ToString(), 
            user.Status.ToString()
        );

        return Result<UserDto>.Success(dto);
    }
}
