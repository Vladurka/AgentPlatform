using AgentPlatform.Chat.Application.DTOs;
using MediatR;

namespace AgentPlatform.Chat.Application.Commands;

public record SendMessageCommand(
    Guid AgentId,
    string AgentInstructions,
    string LlmProvider,
    string LlmModel,
    string ApiKey,
    string Message,
    string? SessionId) : IRequest<ChatResponse>;
