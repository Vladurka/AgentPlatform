using MediatR;

namespace AgentPlatform.Agents.Application.Commands;

public record DeleteAgentCommand(Guid AgentId, Guid OwnerId) : IRequest;
