using AgentPlatform.Chat.Application.DTOs;
using AgentPlatform.Chat.Application.Interfaces;
using AgentPlatform.Chat.Domain.Entities;
using AgentPlatform.Shared.Domain;
using MediatR;

namespace AgentPlatform.Chat.Application.Commands;

public class SendMessageCommandHandler(
    IConversationRepository conversationRepository,
    IAiServiceClient aiServiceClient,
    IUnitOfWork unitOfWork) : IRequestHandler<SendMessageCommand, ChatResponse>
{
    public async Task<ChatResponse> Handle(SendMessageCommand request, CancellationToken ct)
    {
        var sessionId = request.SessionId ?? Guid.NewGuid().ToString("N");

        var conversation = await conversationRepository.GetBySessionIdAsync(sessionId, ct);
        var isNew = conversation is null;
        if (isNew)
        {
            conversation = new Conversation
            {
                AgentId = request.AgentId,
                SessionId = sessionId
            };
            await conversationRepository.AddAsync(conversation, ct);
        }

        var history = conversation.Messages
            .Select(m => new MessageHistory(m.Role, m.Content))
            .ToList();

        var result = await aiServiceClient.SendMessageAsync(
            request.AgentId, sessionId, request.Message, request.AgentInstructions,
            request.LlmProvider, request.LlmModel, request.ApiKey, history, ct);

        conversation.Messages.Add(new ChatMessage { Role = "user", Content = request.Message });
        conversation.Messages.Add(new ChatMessage { Role = "assistant", Content = result.Answer });

        if (!isNew)
            conversationRepository.Update(conversation);

        await unitOfWork.SaveChangesAsync(ct);

        return new ChatResponse(result.Answer, result.Sources, sessionId);
    }
}
