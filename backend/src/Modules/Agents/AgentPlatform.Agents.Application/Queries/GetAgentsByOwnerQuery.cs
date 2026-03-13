using AgentPlatform.Agents.Application.DTOs;
using MediatR;

namespace AgentPlatform.Agents.Application.Queries;

public record GetAgentsByOwnerQuery(Guid OwnerId) : IRequest<IReadOnlyList<AgentDto>>;
