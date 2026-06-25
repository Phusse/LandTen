using System.Collections.Concurrent;

namespace MessagingService.Application.Services;

public class TypingStatusCache
{
    // Key: ConversationId_UserId, Value: Expiration timestamp
    private readonly ConcurrentDictionary<string, DateTime> _typingStatuses = new();

    public void SetTypingStatus(Guid conversationId, Guid userId)
    {
        var key = $"{conversationId}_{userId}";
        // Expires in 3 seconds
        _typingStatuses[key] = DateTime.UtcNow.AddSeconds(3);
    }

    public bool IsUserTyping(Guid conversationId, Guid userId)
    {
        var key = $"{conversationId}_{userId}";
        if (_typingStatuses.TryGetValue(key, out var expiresAt))
        {
            if (DateTime.UtcNow <= expiresAt)
                return true;
            
            // Cleanup expired
            _typingStatuses.TryRemove(key, out _);
        }
        return false;
    }
}
