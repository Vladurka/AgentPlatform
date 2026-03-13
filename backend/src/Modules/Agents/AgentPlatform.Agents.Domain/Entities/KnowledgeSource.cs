using AgentPlatform.Shared.Domain;

namespace AgentPlatform.Agents.Domain.Entities;

public class KnowledgeSource : BaseEntity
{
    public Guid AgentId { get; set; }
    public KnowledgeSourceType Type { get; set; }
    public string? ContentRaw { get; set; }
    public string? SourceUrl { get; set; }
    public KnowledgeSourceStatus Status { get; set; } = KnowledgeSourceStatus.Pending;
    public string? VectorNamespace { get; set; }

    public Agent Agent { get; set; } = null!;
}

public enum KnowledgeSourceType { Url, Pdf, Text, Faq }
public enum KnowledgeSourceStatus { Pending, Processing, Ready, Failed }
