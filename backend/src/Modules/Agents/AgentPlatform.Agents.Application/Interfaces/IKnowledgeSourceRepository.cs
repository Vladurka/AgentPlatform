using AgentPlatform.Agents.Domain.Entities;
using AgentPlatform.Shared.Domain;

namespace AgentPlatform.Agents.Application.Interfaces;

public interface IKnowledgeSourceRepository : IRepository<KnowledgeSource>
{
    Task<IReadOnlyList<KnowledgeSource>> GetByAgentIdAsync(Guid agentId, CancellationToken ct = default);
    Task<int> CountByAgentIdAsync(Guid agentId, CancellationToken ct = default);
}
