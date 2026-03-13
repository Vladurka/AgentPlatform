namespace AgentPlatform.Chat.Application.DTOs;

public record SendMessageRequest(string Message, string? SessionId);
public record ChatResponse(string Answer, List<string> Sources, string SessionId);
