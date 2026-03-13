using AgentPlatform.Chat.Application.DTOs;
using MediatR;

namespace AgentPlatform.Chat.Application.Commands;

public record SendMessageCommand(
    Guid AgentId,
    string AgentInstructions,
    string Message,
    string? SessionId) : IRequest<ChatResponse>;
