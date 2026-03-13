using AgentPlatform.Agents.Application.DTOs;
using AgentPlatform.Agents.Application.Interfaces;
using MediatR;

namespace AgentPlatform.Agents.Application.Queries;

public class GetAgentsByOwnerQueryHandler(
    IAgentRepository agentRepository) : IRequestHandler<GetAgentsByOwnerQuery, IReadOnlyList<AgentDto>>
{
    public async Task<IReadOnlyList<AgentDto>> Handle(GetAgentsByOwnerQuery request, CancellationToken ct)
    {
        var agents = await agentRepository.GetByOwnerIdAsync(request.OwnerId, ct);
        return agents.Select(a => new AgentDto(
            a.Id, a.Name, a.Description, a.Instructions,
            a.EmbedToken, a.Status.ToString(),
            a.LlmProvider.ToString(), a.LlmModel.ToString(), a.CreatedAt)).ToList();
    }
}
