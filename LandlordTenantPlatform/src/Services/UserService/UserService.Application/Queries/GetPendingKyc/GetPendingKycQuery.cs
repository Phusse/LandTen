using MediatR;
using BuildingBlocks.Common.Wrappers;
using UserService.Application.Interfaces;

namespace UserService.Application.Queries.GetPendingKyc;

public record PendingKycDto(Guid Id, Guid UserId, string UserName, string UserEmail, string UserRole, string DocumentType, string FileUrl, DateTime CreatedAt);

public record GetPendingKycQuery() : IRequest<Result<IEnumerable<PendingKycDto>>>;

public class GetPendingKycQueryHandler : IRequestHandler<GetPendingKycQuery, Result<IEnumerable<PendingKycDto>>>
{
    private readonly IUserRepository _userRepository;

    public GetPendingKycQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<IEnumerable<PendingKycDto>>> Handle(GetPendingKycQuery request, CancellationToken cancellationToken)
    {
        var pendingDocs = await _userRepository.GetPendingKycDocumentsAsync(cancellationToken);

        var dtos = pendingDocs.Select(d => new PendingKycDto(
            d.Id,
            d.UserId,
            $"{d.User.UserProfile?.FirstName} {d.User.UserProfile?.LastName}".Trim(),
            d.User.Email,
            d.User.Role.ToString(),
            d.DocumentType,
            d.FileUrl,
            d.CreatedAt
        ));

        return Result<IEnumerable<PendingKycDto>>.Success(dtos);
    }
}
