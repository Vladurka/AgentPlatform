using System.Text.Json;
using AgentPlatform.Agents.Application.Interfaces;
using AgentPlatform.Chat.Application.Commands;
using AgentPlatform.Chat.Application.DTOs;
using AgentPlatform.Shared.Application;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using StackExchange.Redis;

namespace AgentPlatform.Chat.Endpoints;

public static class ChatEndpoints
{
    private record AgentCache(string AgentId, string Instructions, string LlmProvider, string LlmModel, string ApiKeyEncrypted);

    public static IEndpointRouteBuilder MapChatEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/chat").WithTags("Chat");

        group.MapPost("/{token}/message", async (
            string token,
            SendMessageRequest request,
            IMediator mediator,
            IAgentRepository agentRepository,
            IEncryptionService encryption,
            IConnectionMultiplexer redis,
            CancellationToken ct) =>
        {
            var db = redis.GetDatabase();
            var rateLimitKey = $"rl:chat:{token}";
            var batch = db.CreateBatch();
            var incrTask = batch.StringIncrementAsync(rateLimitKey);
            var expireTask = batch.KeyExpireAsync(rateLimitKey, TimeSpan.FromMinutes(1), ExpireWhen.HasNoExpiry);
            batch.Execute();
            var count = await incrTask;
            await expireTask;
            if (count > 100)
                return Results.Json(ApiResponse<ChatResponse>.Fail("Rate limit exceeded"), statusCode: 429);

            var cacheKey = $"agent:token:{token}";
            Guid agentId;
            string instructions, llmProvider, llmModel, apiKey;

            AgentCache? cached = null;
            var cachedValue = await db.StringGetAsync(cacheKey);
            if (cachedValue.HasValue)
            {
                try { cached = JsonSerializer.Deserialize<AgentCache>((string)cachedValue!); }
                catch { /* stale cache — fall through to DB */ }
            }

            if (cached is not null)
            {
                agentId = Guid.Parse(cached.AgentId);
                instructions = cached.Instructions;
                llmProvider = cached.LlmProvider;
                llmModel = cached.LlmModel;
                apiKey = encryption.Decrypt(cached.ApiKeyEncrypted);
            }
            else
            {
                var agent = await agentRepository.GetByEmbedTokenAsync(token, ct);
                if (agent is null)
                    return Results.NotFound(ApiResponse<ChatResponse>.Fail("Agent not found"));

                agentId = agent.Id;
                instructions = agent.Instructions;
                llmProvider = agent.LlmProvider.ToString();
                llmModel = agent.LlmModel.ToString();
                apiKey = encryption.Decrypt(agent.ApiKeyEncrypted);

                var cacheEntry = new AgentCache(agentId.ToString(), instructions, llmProvider, llmModel, agent.ApiKeyEncrypted);
                await db.StringSetAsync(cacheKey, JsonSerializer.Serialize(cacheEntry), TimeSpan.FromMinutes(10));
            }

            var result = await mediator.Send(
                new SendMessageCommand(agentId, instructions, llmProvider, llmModel, apiKey, request.Message, request.SessionId), ct);

            return Results.Ok(ApiResponse<ChatResponse>.Success(result));
        }).AllowAnonymous();

        return app;
    }
}
