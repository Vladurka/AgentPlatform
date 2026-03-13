using AgentPlatform.Agents.Application.DTOs;
using MediatR;

namespace AgentPlatform.Agents.Application.Queries;

public record GetAgentByIdQuery(Guid AgentId, Guid OwnerId) : IRequest<AgentDto>;
