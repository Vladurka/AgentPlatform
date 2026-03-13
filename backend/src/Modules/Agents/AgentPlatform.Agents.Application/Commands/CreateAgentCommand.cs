using AgentPlatform.Agents.Application.DTOs;
using MediatR;

namespace AgentPlatform.Agents.Application.Commands;

public record CreateAgentCommand(Guid OwnerId, string Plan, string Name, string? Description, string Instructions) : IRequest<AgentDto>;
