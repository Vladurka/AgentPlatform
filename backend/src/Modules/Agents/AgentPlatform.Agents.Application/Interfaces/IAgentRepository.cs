using AgentPlatform.Agents.Domain.Entities;
using AgentPlatform.Shared.Domain;

namespace AgentPlatform.Agents.Application.Interfaces;

public interface IAgentRepository : IRepository<Agent>
{
    Task<Agent?> GetByEmbedTokenAsync(string embedToken, CancellationToken ct = default);
    Task<IReadOnlyList<Agent>> GetByOwnerIdAsync(Guid ownerId, CancellationToken ct = default);
    Task<Agent?> GetWithSourcesAsync(Guid id, CancellationToken ct = default);
}
