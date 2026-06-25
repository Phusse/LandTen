using BuildingBlocks.Common.Abstractions;

namespace MessagingService.Domain.Entities;

/// <summary>
/// Represents a direct conversation channel between two users,
/// optionally scoped to a specific property listing.
/// User1Id is always the lexicographically smaller of the two user IDs
/// (enforced at creation time) to prevent duplicate conversations.
/// </summary>
public sealed class Conversation : BaseEntity
{
    public Guid User1Id { get; private set; }
    public Guid User2Id { get; private set; }
    public Guid? PropertyId { get; private set; }
    public bool User1Deleted { get; private set; }
    public bool User2Deleted { get; private set; }

    // Navigation property for EF Core
    public ICollection<Message> Messages { get; private set; } = new List<Message>();

    private Conversation() { } // EF Core ctor

    public static Conversation Create(Guid user1Id, Guid user2Id, Guid? propertyId)
    {
        // Normalize: smaller GUID string is always User1Id
        var (normalizedUser1, normalizedUser2) = NormalizeUserIds(user1Id, user2Id);
        return new Conversation
        {
            Id = Guid.NewGuid(),
            User1Id = normalizedUser1,
            User2Id = normalizedUser2,
            PropertyId = propertyId,
            CreatedAt = DateTime.UtcNow,
        };
    }

    public static (Guid user1, Guid user2) NormalizeUserIds(Guid a, Guid b)
    {
        return string.Compare(a.ToString(), b.ToString(), StringComparison.Ordinal) <= 0
            ? (a, b)
            : (b, a);
    }

    public bool IsParticipant(Guid userId) => User1Id == userId || User2Id == userId;

    public Guid GetOtherParticipant(Guid callerId)
        => User1Id == callerId ? User2Id : User1Id;

    public void SoftDelete(Guid userId)
    {
        if (userId == User1Id) User1Deleted = true;
        if (userId == User2Id) User2Deleted = true;
    }
}
