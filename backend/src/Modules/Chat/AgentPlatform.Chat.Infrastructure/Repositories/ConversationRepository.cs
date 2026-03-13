using AgentPlatform.Chat.Application.Interfaces;
using AgentPlatform.Chat.Domain.Entities;
using AgentPlatform.Shared.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace AgentPlatform.Chat.Infrastructure.Repositories;

public class ConversationRepository(DbContext context) : BaseRepository<Conversation>(context), IConversationRepository
{
    public async Task<Conversation?> GetBySessionIdAsync(string sessionId, CancellationToken ct = default)
        => await DbSet.FirstOrDefaultAsync(c => c.SessionId == sessionId, ct);
}
