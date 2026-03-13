using AgentPlatform.Agents.Application.Interfaces;
using AgentPlatform.Agents.Domain.Entities;
using AgentPlatform.Shared.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace AgentPlatform.Agents.Infrastructure.Repositories;

public class KnowledgeSourceRepository(DbContext context) : BaseRepository<KnowledgeSource>(context), IKnowledgeSourceRepository
{
    public async Task<IReadOnlyList<KnowledgeSource>> GetByAgentIdAsync(Guid agentId, CancellationToken ct = default)
        => await DbSet.Where(ks => ks.AgentId == agentId).ToListAsync(ct);

    public async Task<int> CountByAgentIdAsync(Guid agentId, CancellationToken ct = default)
        => await DbSet.Where(ks => ks.AgentId == agentId).CountAsync(ct);
}
