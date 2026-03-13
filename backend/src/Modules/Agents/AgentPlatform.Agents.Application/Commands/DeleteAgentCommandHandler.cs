using AgentPlatform.Agents.Application.Interfaces;
using AgentPlatform.Shared.Domain;
using MediatR;

namespace AgentPlatform.Agents.Application.Commands;

public class DeleteAgentCommandHandler(
    IAgentRepository agentRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<DeleteAgentCommand>
{
    public async Task Handle(DeleteAgentCommand request, CancellationToken ct)
    {
        var agent = await agentRepository.GetByIdAsync(request.AgentId, ct)
            ?? throw new KeyNotFoundException($"Agent {request.AgentId} not found.");

        if (agent.OwnerId != request.OwnerId)
            throw new UnauthorizedAccessException("You don't own this agent.");

        agentRepository.Delete(agent);
        await unitOfWork.SaveChangesAsync(ct);
    }
}
