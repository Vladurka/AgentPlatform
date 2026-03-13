using AgentPlatform.Agents.Application.DTOs;
using AgentPlatform.Agents.Application.Interfaces;
using AgentPlatform.Agents.Application.Messages;
using AgentPlatform.Agents.Domain.Entities;
using AgentPlatform.Shared.Domain;
using MassTransit;
using MediatR;

namespace AgentPlatform.Agents.Application.Commands;

public class AddKnowledgeSourceCommandHandler(
    IAgentRepository agentRepository,
    IKnowledgeSourceRepository knowledgeSourceRepository,
    IUnitOfWork unitOfWork,
    IPublishEndpoint publishEndpoint) : IRequestHandler<AddKnowledgeSourceCommand, KnowledgeSourceDto>
{
    private static readonly Dictionary<string, int> SourceLimits = new(StringComparer.OrdinalIgnoreCase)
    {
        { "free", 5 },
        { "pro", int.MaxValue },
        { "business", int.MaxValue }
    };

    public async Task<KnowledgeSourceDto> Handle(AddKnowledgeSourceCommand request, CancellationToken ct)
    {
        var agent = await agentRepository.GetByIdAsync(request.AgentId, ct)
            ?? throw new KeyNotFoundException($"Agent {request.AgentId} not found.");

        if (agent.OwnerId != request.OwnerId)
            throw new UnauthorizedAccessException("You don't own this agent.");

        var limit = SourceLimits.GetValueOrDefault(request.Plan, 5);
        var sourceCount = await knowledgeSourceRepository.CountByAgentIdAsync(request.AgentId, ct);
        if (sourceCount >= limit)
            throw new InvalidOperationException(
                $"Plan '{request.Plan}' allows a maximum of {limit} knowledge source(s) per agent. Upgrade to add more.");

        if (!Enum.TryParse<KnowledgeSourceType>(request.Type, true, out var sourceType))
            throw new ArgumentException($"Invalid source type: {request.Type}");

        var source = new KnowledgeSource
        {
            AgentId = request.AgentId,
            Type = sourceType,
            ContentRaw = request.Content,
            SourceUrl = request.SourceUrl,
            VectorNamespace = $"agent_{request.AgentId:N}",
            Status = KnowledgeSourceStatus.Pending
        };

        await knowledgeSourceRepository.AddAsync(source, ct);
        await unitOfWork.SaveChangesAsync(ct);

        var content = sourceType == KnowledgeSourceType.Url
            ? request.SourceUrl!
            : request.Content ?? string.Empty;

        await publishEndpoint.Publish(new IngestionRequestedEvent
        {
            AgentId = request.AgentId,
            SourceId = source.Id,
            SourceType = sourceType.ToString().ToLower(),
            Content = content
        }, ct);

        return new KnowledgeSourceDto(source.Id, source.AgentId, source.Type.ToString(),
            source.Status.ToString(), source.SourceUrl, source.CreatedAt);
    }
}
