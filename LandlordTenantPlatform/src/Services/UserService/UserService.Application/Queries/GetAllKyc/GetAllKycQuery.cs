using MediatR;
using BuildingBlocks.Common.Wrappers;
using UserService.Application.Interfaces;

namespace UserService.Application.Queries.GetAllKyc;

public record KycDto(Guid Id, Guid UserId, string UserName, string UserEmail, string UserRole, string DocumentType, string FileUrl, string Status, DateTime CreatedAt);

public record GetAllKycQuery(string? Status) : IRequest<Result<IEnumerable<KycDto>>>;

public class GetAllKycQueryHandler : IRequestHandler<GetAllKycQuery, Result<IEnumerable<KycDto>>>
{
    private readonly IUserRepository _userRepository;

    public GetAllKycQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<IEnumerable<KycDto>>> Handle(GetAllKycQuery request, CancellationToken cancellationToken)
    {
        UserService.Domain.Enums.KycDocumentStatus? statusFilter = null;
        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<UserService.Domain.Enums.KycDocumentStatus>(request.Status, true, out var parsed))
        {
            statusFilter = parsed;
        }

        var docs = await _userRepository.GetKycDocumentsAsync(statusFilter, cancellationToken);

        var dtos = docs.Select(d => new KycDto(
            d.Id,
            d.UserId,
            $"{d.User.UserProfile?.FirstName} {d.User.UserProfile?.LastName}".Trim(),
            d.User.Email,
            d.User.Role.ToString(),
            d.DocumentType,
            d.FileUrl,
            d.Status.ToString(),
            d.CreatedAt
        ));

        return Result<IEnumerable<KycDto>>.Success(dtos);
    }
}
