using FluentValidation;
using MediatR;
using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using UserService.Application.Interfaces;
using BuildingBlocks.Common.Interfaces;

namespace UserService.Application.Commands.UploadAvatar;

public record UploadAvatarCommand(Guid UserId, Stream FileStream, string FileName) : IRequest<Result<string>>;

public class UploadAvatarCommandValidator : AbstractValidator<UploadAvatarCommand>
{
    public UploadAvatarCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.FileStream).NotNull();
        RuleFor(x => x.FileName).NotEmpty();
    }
}

public class UploadAvatarCommandHandler : IRequestHandler<UploadAvatarCommand, Result<string>>
{
    private readonly IUserRepository _userRepository;
    private readonly IMediaStorageService _mediaStorageService;

    public UploadAvatarCommandHandler(IUserRepository userRepository, IMediaStorageService mediaStorageService)
    {
        _userRepository = userRepository;
        _mediaStorageService = mediaStorageService;
    }

    public async Task<Result<string>> Handle(UploadAvatarCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
            throw new NotFoundException($"User {request.UserId} not found.");

        if (user.UserProfile == null)
            throw new NotFoundException($"User profile for user {request.UserId} not found.");

        var avatarUrl = await _mediaStorageService.UploadImageAsync(request.FileStream, request.FileName, cancellationToken);

        user.UserProfile.AvatarUrl = avatarUrl;
        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(avatarUrl);
    }
}
