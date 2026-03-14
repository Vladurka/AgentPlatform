using AgentPlatform.Agents.Application.DTOs;
using AgentPlatform.Agents.Application.Interfaces;
using AgentPlatform.Shared.Application;
using AgentPlatform.Shared.Domain;
using MediatR;

namespace AgentPlatform.Agents.Application.Commands;

public class UpdateAgentCommandHandler(
    IAgentRepository agentRepository,
    IUnitOfWork unitOfWork,
    IEncryptionService encryption) : IRequestHandler<UpdateAgentCommand, AgentDto>
{
    public async Task<AgentDto> Handle(UpdateAgentCommand request, CancellationToken ct)
    {
        var agent = await agentRepository.GetByIdAsync(request.AgentId, ct)
            ?? throw new KeyNotFoundException($"Agent {request.AgentId} not found.");

        if (agent.OwnerId != request.OwnerId)
            throw new UnauthorizedAccessException("You don't own this agent.");

        agent.Name = request.Name;
        agent.Description = request.Description;
        agent.Instructions = request.Instructions;
        agent.LlmProvider = request.LlmProvider;
        agent.LlmModel = request.LlmModel;
        if (!string.IsNullOrEmpty(request.ApiKey))
            agent.ApiKeyEncrypted = encryption.Encrypt(request.ApiKey);

        agentRepository.Update(agent);
        await unitOfWork.SaveChangesAsync(ct);

        return new AgentDto(
            agent.Id, agent.Name, agent.Description, agent.Instructions,
            agent.EmbedToken, agent.Status.ToString(),
            agent.LlmProvider.ToString(), agent.LlmModel.ToString(), agent.CreatedAt);
    }
}
