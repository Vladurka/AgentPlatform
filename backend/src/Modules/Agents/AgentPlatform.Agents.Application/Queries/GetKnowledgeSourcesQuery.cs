using AgentPlatform.Agents.Application.DTOs;
using MediatR;

namespace AgentPlatform.Agents.Application.Queries;

public record GetKnowledgeSourcesQuery(Guid AgentId, Guid OwnerId) : IRequest<IReadOnlyList<KnowledgeSourceDto>>;
