namespace BuildingBlocks.Common.Pagination;

/// <summary>
/// Standard pagination request parameters.
/// Page numbers are 1-indexed. PageSize is capped at 100.
/// </summary>
public sealed class PaginationParams
{
    private const int MaxPageSize = 100;
    private int _pageSize = 10;

    public int PageNumber { get; init; } = 1;

    public int PageSize
    {
        get => _pageSize;
        init => _pageSize = value > MaxPageSize ? MaxPageSize : value < 1 ? 1 : value;
    }
}
