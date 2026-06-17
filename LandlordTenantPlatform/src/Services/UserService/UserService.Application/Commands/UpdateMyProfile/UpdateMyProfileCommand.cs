using FluentValidation;
using MediatR;
using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using UserService.Application.Interfaces;

namespace UserService.Application.Commands.UpdateMyProfile;

public record UpdateMyProfileCommand(Guid UserId, string FirstName, string LastName) : IRequest<Result<bool>>;

public class UpdateMyProfileCommandValidator : AbstractValidator<UpdateMyProfileCommand>
{
    public UpdateMyProfileCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.FirstName).NotEmpty();
        RuleFor(x => x.LastName).NotEmpty();
    }
}

public class UpdateMyProfileCommandHandler : IRequestHandler<UpdateMyProfileCommand, Result<bool>>
{
    private readonly IUserRepository _userRepository;

    public UpdateMyProfileCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<bool>> Handle(UpdateMyProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
            throw new NotFoundException($"User {request.UserId} not found.");

        if (user.UserProfile == null)
            throw new NotFoundException($"User profile not found.");

        user.UserProfile.FirstName = request.FirstName;
        user.UserProfile.LastName = request.LastName;
        // TODO: Handle Phone number updates via OTP flow

        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
