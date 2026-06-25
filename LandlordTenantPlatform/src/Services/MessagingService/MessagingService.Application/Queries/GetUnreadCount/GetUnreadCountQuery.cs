using MediatR;
using BuildingBlocks.Common.Wrappers;
using MessagingService.Application.Interfaces;

namespace MessagingService.Application.Queries.GetUnreadCount;

public record GetUnreadCountQuery(Guid CallerId) : IRequest<Result<int>>;

public class GetUnreadCountQueryHandler
    : IRequestHandler<GetUnreadCountQuery, Result<int>>
{
    private readonly IMessagingRepository _repo;

    public GetUnreadCountQueryHandler(IMessagingRepository repo)
        => _repo = repo;

    public async Task<Result<int>> Handle(
        GetUnreadCountQuery request,
        CancellationToken cancellationToken)
    {
        var count = await _repo.GetUnreadCountAsync(request.CallerId, cancellationToken);
        return Result<int>.Success(count);
    }
}
