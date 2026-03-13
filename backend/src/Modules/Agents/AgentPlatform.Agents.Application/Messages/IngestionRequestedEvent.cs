namespace AgentPlatform.Agents.Application.Messages;

public record IngestionRequestedEvent
{
    public Guid AgentId { get; init; }
    public Guid SourceId { get; init; }
    public string SourceType { get; init; } = string.Empty; // text, url, pdf
    public string Content { get; init; } = string.Empty;
}
