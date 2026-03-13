using AgentPlatform.Agents.Application.DTOs;
using AgentPlatform.Agents.Application.Interfaces;
using MediatR;

namespace AgentPlatform.Agents.Application.Queries;

public class GetKnowledgeSourcesQueryHandler(
    IAgentRepository agentRepository,
    IKnowledgeSourceRepository knowledgeSourceRepository)
    : IRequestHandler<GetKnowledgeSourcesQuery, IReadOnlyList<KnowledgeSourceDto>>
{
    public async Task<IReadOnlyList<KnowledgeSourceDto>> Handle(GetKnowledgeSourcesQuery request, CancellationToken ct)
    {
        var agent = await agentRepository.GetByIdAsync(request.AgentId, ct)
            ?? throw new KeyNotFoundException($"Agent {request.AgentId} not found.");

        if (agent.OwnerId != request.OwnerId)
            throw new UnauthorizedAccessException("You don't own this agent.");

        var sources = await knowledgeSourceRepository.GetByAgentIdAsync(request.AgentId, ct);
        return sources.Select(s => new KnowledgeSourceDto(
            s.Id, s.AgentId, s.Type.ToString(), s.Status.ToString(), s.SourceUrl, s.CreatedAt)).ToList();
    }
}
