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
    public static IEndpointRouteBuilder MapChatEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/chat").WithTags("Chat");

        group.MapPost("/{token}/message", async (
            string token,
            SendMessageRequest request,
            IMediator mediator,
            IAgentRepository agentRepository,
            IConnectionMultiplexer redis,
            CancellationToken ct) =>
        {
            // Rate limit: 100 req/min per embed token (batch INCR+EXPIRE to prevent TTL-less keys on crash)
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

            // Resolve agent from embed token (Redis cache → DB fallback)
            var cacheKey = $"agent:token:{token}";
            Guid agentId;
            string instructions;

            var cachedValue = await db.StringGetAsync(cacheKey);
            if (cachedValue.HasValue)
            {
                var parts = ((string)cachedValue!).Split('|', 2);
                agentId = Guid.Parse(parts[0]);
                instructions = parts.Length > 1 ? parts[1] : string.Empty;
            }
            else
            {
                var agent = await agentRepository.GetByEmbedTokenAsync(token, ct);
                if (agent is null)
                    return Results.NotFound(ApiResponse<ChatResponse>.Fail("Agent not found"));

                agentId = agent.Id;
                instructions = agent.Instructions ?? string.Empty;
                await db.StringSetAsync(cacheKey, $"{agentId}|{instructions}", TimeSpan.FromMinutes(10));
            }

            var result = await mediator.Send(
                new SendMessageCommand(agentId, instructions, request.Message, request.SessionId), ct);

            return Results.Ok(ApiResponse<ChatResponse>.Success(result));
        }).AllowAnonymous();

        return app;
    }
}
