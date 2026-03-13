namespace AgentPlatform.Agents.Application.Messages;

public record IngestionStatusUpdatedEvent
{
    public Guid SourceId { get; init; }
    public string Status { get; init; } = string.Empty; // processing, ready, failed
}
