using AgentPlatform.Agents.Application.DTOs;
using MediatR;

namespace AgentPlatform.Agents.Application.Commands;

public record AddKnowledgeSourceCommand(Guid AgentId, Guid OwnerId, string Plan, string Type, string? Content, string? SourceUrl) : IRequest<KnowledgeSourceDto>;
