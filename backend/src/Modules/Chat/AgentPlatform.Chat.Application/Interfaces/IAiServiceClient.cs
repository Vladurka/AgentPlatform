namespace AgentPlatform.Chat.Application.Interfaces;

public interface IAiServiceClient
{
    Task<ChatCompletionResult> SendMessageAsync(
        Guid agentId, string sessionId, string message,
        string instructions, string llmProvider, string llmModel, string apiKey,
        List<MessageHistory> history, CancellationToken ct = default);
}

public record ChatCompletionResult(string Answer, List<string> Sources, int TokensUsed);
public record MessageHistory(string Role, string Content);
