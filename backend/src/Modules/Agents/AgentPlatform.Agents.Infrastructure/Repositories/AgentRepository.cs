using AgentPlatform.Agents.Application.Interfaces;
using AgentPlatform.Agents.Domain.Entities;
using AgentPlatform.Shared.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace AgentPlatform.Agents.Infrastructure.Repositories;

public class AgentRepository(DbContext context) : BaseRepository<Agent>(context), IAgentRepository
{
    public async Task<Agent?> GetByEmbedTokenAsync(string embedToken, CancellationToken ct = default)
        => await DbSet.FirstOrDefaultAsync(a => a.EmbedToken == embedToken, ct);

    public async Task<IReadOnlyList<Agent>> GetByOwnerIdAsync(Guid ownerId, CancellationToken ct = default)
        => await DbSet.Where(a => a.OwnerId == ownerId).ToListAsync(ct);

    public async Task<Agent?> GetWithSourcesAsync(Guid id, CancellationToken ct = default)
        => await DbSet.Include(a => a.KnowledgeSources).FirstOrDefaultAsync(a => a.Id == id, ct);
}
