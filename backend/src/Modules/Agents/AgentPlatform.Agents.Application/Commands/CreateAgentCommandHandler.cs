using AgentPlatform.Agents.Application.DTOs;
using AgentPlatform.Agents.Application.Interfaces;
using AgentPlatform.Agents.Domain.Entities;
using AgentPlatform.Shared.Domain;
using MediatR;

namespace AgentPlatform.Agents.Application.Commands;

public class CreateAgentCommandHandler(
    IAgentRepository agentRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<CreateAgentCommand, AgentDto>
{
    private static readonly Dictionary<string, int> AgentLimits = new(StringComparer.OrdinalIgnoreCase)
    {
        { "free", 1 },
        { "pro", 10 },
        { "business", int.MaxValue }
    };

    public async Task<AgentDto> Handle(CreateAgentCommand request, CancellationToken ct)
    {
        var limit = AgentLimits.GetValueOrDefault(request.Plan, 1);
        var existing = await agentRepository.GetByOwnerIdAsync(request.OwnerId, ct);
        if (existing.Count >= limit)
            throw new InvalidOperationException(
                $"Plan '{request.Plan}' allows a maximum of {limit} agent(s). Upgrade to create more.");

        var agent = new Agent
        {
            Name = request.Name,
            Description = request.Description,
            Instructions = request.Instructions,
            OwnerId = request.OwnerId
        };

        await agentRepository.AddAsync(agent, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return new AgentDto(
            agent.Id, agent.Name, agent.Description, agent.Instructions,
            agent.EmbedToken, agent.Status.ToString(), agent.CreatedAt);
    }
}
