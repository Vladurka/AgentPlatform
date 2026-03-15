using MediatR;

namespace AgentPlatform.Agents.Application.Commands;

public record DeleteKnowledgeSourceCommand(Guid SourceId, Guid OwnerId) : IRequest;
