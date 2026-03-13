using AgentPlatform.Agents.Application.Interfaces;
using AgentPlatform.Agents.Application.Messages;
using AgentPlatform.Agents.Domain.Entities;
using AgentPlatform.Shared.Domain;
using MassTransit;

namespace AgentPlatform.Agents.Infrastructure.Consumers;

public class IngestionStatusConsumer(
    IKnowledgeSourceRepository knowledgeSourceRepository,
    IUnitOfWork unitOfWork) : IConsumer<IngestionStatusUpdatedEvent>
{
    public async Task Consume(ConsumeContext<IngestionStatusUpdatedEvent> context)
    {
        var ct = context.CancellationToken;
        var msg = context.Message;
        var source = await knowledgeSourceRepository.GetByIdAsync(msg.SourceId, ct);
        if (source is null) return;

        if (Enum.TryParse<KnowledgeSourceStatus>(msg.Status, ignoreCase: true, out var newStatus))
            source.Status = newStatus;

        knowledgeSourceRepository.Update(source);
        await unitOfWork.SaveChangesAsync(ct);
    }
}
