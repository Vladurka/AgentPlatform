using AgentPlatform.Agents.Application.DTOs;
using AgentPlatform.Agents.Application.Interfaces;
using MediatR;

namespace AgentPlatform.Agents.Application.Queries;

public class GetAgentByIdQueryHandler(IAgentRepository agentRepository)
    : IRequestHandler<GetAgentByIdQuery, AgentDto>
{
    public async Task<AgentDto> Handle(GetAgentByIdQuery request, CancellationToken ct)
    {
        var agent = await agentRepository.GetByIdAsync(request.AgentId, ct)
            ?? throw new KeyNotFoundException($"Agent {request.AgentId} not found.");

        if (agent.OwnerId != request.OwnerId)
            throw new UnauthorizedAccessException("You don't own this agent.");

        return new AgentDto(
            agent.Id, agent.Name, agent.Description, agent.Instructions,
            agent.EmbedToken, agent.Status.ToString(),
            agent.LlmProvider.ToString(), agent.LlmModel.ToString(), agent.CreatedAt);
    }
}
