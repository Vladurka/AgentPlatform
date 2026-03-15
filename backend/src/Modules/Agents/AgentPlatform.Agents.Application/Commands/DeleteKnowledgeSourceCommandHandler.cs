using AgentPlatform.Agents.Application.Interfaces;
using AgentPlatform.Shared.Domain;
using MediatR;

namespace AgentPlatform.Agents.Application.Commands;

public class DeleteKnowledgeSourceCommandHandler(
    IKnowledgeSourceRepository knowledgeSourceRepository,
    IAgentRepository agentRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<DeleteKnowledgeSourceCommand>
{
    public async Task Handle(DeleteKnowledgeSourceCommand request, CancellationToken ct)
    {
        var source = await knowledgeSourceRepository.GetByIdAsync(request.SourceId, ct)
            ?? throw new KeyNotFoundException($"Knowledge source {request.SourceId} not found.");

        var agent = await agentRepository.GetByIdAsync(source.AgentId, ct)
            ?? throw new KeyNotFoundException($"Agent {source.AgentId} not found.");

        if (agent.OwnerId != request.OwnerId)
            throw new UnauthorizedAccessException("You don't own this agent.");

        knowledgeSourceRepository.Delete(source);
        await unitOfWork.SaveChangesAsync(ct);
    }
}
