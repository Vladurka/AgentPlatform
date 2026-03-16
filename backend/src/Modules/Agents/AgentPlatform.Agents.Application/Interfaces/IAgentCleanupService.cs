namespace AgentPlatform.Agents.Application.Interfaces;

public interface IAgentCleanupService
{
    /// <summary>
    /// Deletes agent vectors from Qdrant (via Python AI service)
    /// and removes the embed-token entry from Redis cache.
    /// Call this BEFORE deleting the agent from the database.
    /// </summary>
    Task CleanupAsync(Guid agentId, string embedToken, CancellationToken ct = default);
}
