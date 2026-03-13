using AgentPlatform.Shared.Domain;

namespace AgentPlatform.Chat.Domain.Entities;

public class Conversation : BaseEntity
{
    public Guid AgentId { get; set; }
    public string SessionId { get; set; } = string.Empty;
    public List<ChatMessage> Messages { get; set; } = [];
}

public class ChatMessage
{
    public string Role { get; set; } = string.Empty; // user, assistant
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
