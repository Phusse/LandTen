using BuildingBlocks.Common.Wrappers;
using MediatR;
using UserService.Application.Interfaces;

namespace UserService.Application.Queries.GetMyKycDocuments;

public record KycDocumentDto(Guid Id, string DocumentType, string Status);

public record GetMyKycDocumentsQuery(Guid UserId) : IRequest<Result<List<KycDocumentDto>>>;

public class GetMyKycDocumentsQueryHandler : IRequestHandler<GetMyKycDocumentsQuery, Result<List<KycDocumentDto>>>
{
    private readonly IUserRepository _userRepository;

    public GetMyKycDocumentsQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<List<KycDocumentDto>>> Handle(GetMyKycDocumentsQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdWithKycAsync(request.UserId, cancellationToken);
        if (user == null)
            return Result<List<KycDocumentDto>>.Failure("User not found");

        var dtos = user.KycDocuments.Select(d => new KycDocumentDto(
            d.Id,
            d.DocumentType,
            d.Status.ToString()
        )).ToList();

        return Result<List<KycDocumentDto>>.Success(dtos);
    }
}
