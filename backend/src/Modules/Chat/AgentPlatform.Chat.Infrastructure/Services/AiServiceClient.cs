using System.Net.Http.Json;
using AgentPlatform.Chat.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace AgentPlatform.Chat.Infrastructure.Services;

public class AiServiceClient : IAiServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;

    public AiServiceClient(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _baseUrl = configuration["AiService:BaseUrl"] ?? "http://localhost:8001";
    }

    public async Task<ChatCompletionResult> SendMessageAsync(
        Guid agentId, string sessionId, string message,
        string instructions, string llmProvider, string llmModel, string apiKey,
        List<MessageHistory> history, CancellationToken ct = default)
    {
        var request = new
        {
            agent_id = agentId,
            session_id = sessionId,
            message,
            instructions,
            llm_provider = llmProvider,
            llm_model = llmModel,
            api_key = apiKey,
            history = history.Select(h => new { role = h.Role, content = h.Content })
        };

        var response = await _httpClient.PostAsJsonAsync($"{_baseUrl}/chat", request, ct);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<AiChatResponse>(ct);
        return new ChatCompletionResult(
            result?.Answer ?? string.Empty,
            result?.Sources ?? [],
            result?.TokensUsed ?? 0);
    }

    private record AiChatResponse(string Answer, List<string> Sources, int TokensUsed);
}
