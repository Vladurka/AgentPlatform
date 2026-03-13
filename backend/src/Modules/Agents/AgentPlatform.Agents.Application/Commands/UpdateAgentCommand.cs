using AgentPlatform.Agents.Application.DTOs;
using MediatR;

namespace AgentPlatform.Agents.Application.Commands;

public record UpdateAgentCommand(Guid AgentId, Guid OwnerId, string Name, string? Description, string Instructions) : IRequest<AgentDto>;
