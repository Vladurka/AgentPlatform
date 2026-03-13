using AgentPlatform.Shared.Domain;

namespace AgentPlatform.Agents.Domain.Entities;

public class Agent : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Instructions { get; set; } = string.Empty; // system prompt
    public Guid OwnerId { get; set; }
    public string EmbedToken { get; set; } = Guid.NewGuid().ToString("N");
    public AgentStatus Status { get; set; } = AgentStatus.Active;

    public ICollection<KnowledgeSource> KnowledgeSources { get; set; } = [];
}

public enum AgentStatus
{
    Active,
    Inactive,
    Training
}
