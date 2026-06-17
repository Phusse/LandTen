namespace BuildingBlocks.Common.Wrappers;

/// <summary>
/// Cursor-free paginated list. Replaces the internal <c>PagedResult&lt;T&gt;</c> type
/// as the canonical pagination wrapper returned by Application layer query handlers.
/// </summary>
/// <typeparam name="T">Item type (typically a DTO).</typeparam>
public sealed class PaginatedList<T>
{
    public IReadOnlyList<T> Items { get; }
    public int PageNumber { get; }
    public int TotalPages { get; }
    public int TotalCount { get; }

    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    [System.Text.Json.Serialization.JsonConstructor]
    public PaginatedList(IReadOnlyList<T> items, int pageNumber, int totalPages, int totalCount)
    {
        Items = items;
        PageNumber = pageNumber;
        TotalPages = totalPages;
        TotalCount = totalCount;
    }

    private PaginatedList(IReadOnlyList<T> items, int totalCount, int pageNumber, int pageSize, bool fromSource)
    {
        Items = items;
        TotalCount = totalCount;
        PageNumber = pageNumber;
        TotalPages = pageSize > 0
            ? (int)Math.Ceiling(totalCount / (double)pageSize)
            : 0;
    }

    /// <summary>
    /// Creates a <see cref="PaginatedList{T}"/> from a pre-sliced in-memory list.
    /// Use when the caller has already applied Skip/Take.
    /// </summary>
    public static PaginatedList<T> Create(
        IReadOnlyList<T> pagedItems,
        int totalCount,
        int pageNumber,
        int pageSize)
        => new(pagedItems, totalCount, pageNumber, pageSize, true);

    /// <summary>
    /// Creates a <see cref="PaginatedList{T}"/> by paging a full source list in memory.
    /// Prefer the EF-Core overload in Infrastructure for database-backed queries.
    /// </summary>
    public static PaginatedList<T> FromSource(
        IEnumerable<T> source,
        int pageNumber,
        int pageSize)
    {
        var list = source.ToList();
        var totalCount = list.Count;
        var items = list
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList()
            .AsReadOnly();

        return new PaginatedList<T>(items, totalCount, pageNumber, pageSize, true);
    }
}
