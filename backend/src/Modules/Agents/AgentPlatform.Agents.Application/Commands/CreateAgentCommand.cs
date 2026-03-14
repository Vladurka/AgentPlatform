using AgentPlatform.Agents.Application.DTOs;
using AgentPlatform.Agents.Domain.Entities;
using MediatR;

namespace AgentPlatform.Agents.Application.Commands;

public record CreateAgentCommand(Guid OwnerId, string Plan, string Name, string? Description, string Instructions, LlmProvider LlmProvider, LlmModel LlmModel, string ApiKey) : IRequest<AgentDto>;
