using AgentPlatform.Agents.Domain.Entities;

namespace AgentPlatform.Agents.Application.DTOs;

public record CreateAgentRequest(string Name, string? Description, string Instructions, LlmProvider LlmProvider, LlmModel LlmModel, string ApiKey);
public record UpdateAgentRequest(string Name, string? Description, string Instructions, LlmProvider LlmProvider, LlmModel LlmModel, string? ApiKey);
public record AgentDto(Guid Id, string Name, string? Description, string Instructions, string EmbedToken, string Status, string LlmProvider, string LlmModel, DateTime CreatedAt);
public record KnowledgeSourceDto(Guid Id, Guid AgentId, string Type, string Status, string? SourceUrl, DateTime CreatedAt);

public record AddKnowledgeSourceRequest(string Type, string? Content, string? SourceUrl);
