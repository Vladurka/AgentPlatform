using AgentPlatform.Agents.Application.DTOs;
using AgentPlatform.Agents.Domain.Entities;
using MediatR;

namespace AgentPlatform.Agents.Application.Commands;

public record UpdateAgentCommand(Guid AgentId, Guid OwnerId, string Name, string? Description, string Instructions, LlmProvider LlmProvider, LlmModel LlmModel, string? ApiKey) : IRequest<AgentDto>;
