using AgentPlatform.Chat.Domain.Entities;
using AgentPlatform.Shared.Domain;

namespace AgentPlatform.Chat.Application.Interfaces;

public interface IConversationRepository : IRepository<Conversation>
{
    Task<Conversation?> GetBySessionIdAsync(string sessionId, CancellationToken ct = default);
}
