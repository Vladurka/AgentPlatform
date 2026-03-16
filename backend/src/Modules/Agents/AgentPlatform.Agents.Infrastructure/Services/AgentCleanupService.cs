using AgentPlatform.Agents.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace AgentPlatform.Agents.Infrastructure.Services;

public class AgentCleanupService(
    HttpClient httpClient,
    IConnectionMultiplexer redis,
    IConfiguration configuration,
    ILogger<AgentCleanupService> logger) : IAgentCleanupService
{
    private readonly string _aiServiceBaseUrl =
        configuration["AiService:BaseUrl"] ?? "http://localhost:8001";

    public async Task CleanupAsync(Guid agentId, string embedToken, CancellationToken ct = default)
    {
        await DeleteFromAiServiceAsync(agentId, ct);
        await InvalidateRedisCacheAsync(embedToken);
    }

    private async Task DeleteFromAiServiceAsync(Guid agentId, CancellationToken ct)
    {
        try
        {
            var response = await httpClient.DeleteAsync($"{_aiServiceBaseUrl}/agent/{agentId}", ct);
            if (!response.IsSuccessStatusCode)
                logger.LogWarning("AI service returned {Status} when deleting agent {AgentId}", response.StatusCode, agentId);
        }
        catch (Exception ex)
        {
            // Non-fatal: log and continue so the agent is still removed from our DB
            logger.LogError(ex, "Failed to delete agent {AgentId} data from AI service", agentId);
        }
    }

    private async Task InvalidateRedisCacheAsync(string embedToken)
    {
        try
        {
            var db = redis.GetDatabase();
            await db.KeyDeleteAsync($"agent:token:{embedToken}");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to invalidate Redis cache for embed token {Token}", embedToken);
        }
    }
}
