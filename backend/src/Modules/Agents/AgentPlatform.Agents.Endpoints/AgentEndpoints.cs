using AgentPlatform.Agents.Application.Commands;
using AgentPlatform.Agents.Application.DTOs;
using AgentPlatform.Agents.Application.Queries;
using AgentPlatform.Shared.Application;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace AgentPlatform.Agents.Endpoints;

public static class AgentEndpoints
{
    public static IEndpointRouteBuilder MapAgentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/agents").WithTags("Agents").RequireAuthorization();

        group.MapGet("/", async (ICurrentUser currentUser, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetAgentsByOwnerQuery(currentUser.UserId));
            return Results.Ok(ApiResponse<IReadOnlyList<AgentDto>>.Success(result));
        });

        group.MapGet("/{id:guid}", async (Guid id, ICurrentUser currentUser, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetAgentByIdQuery(id, currentUser.UserId));
            return Results.Ok(ApiResponse<AgentDto>.Success(result));
        });

        group.MapPost("/", async (CreateAgentRequest request, ICurrentUser currentUser, IMediator mediator) =>
        {
            var result = await mediator.Send(new CreateAgentCommand(
                currentUser.UserId, currentUser.Plan, request.Name, request.Description, request.Instructions,
                request.LlmProvider, request.LlmModel, request.ApiKey));
            return Results.Created($"/api/v1/agents/{result.Id}", ApiResponse<AgentDto>.Success(result));
        });

        group.MapPut("/{id:guid}", async (Guid id, UpdateAgentRequest request, ICurrentUser currentUser, IMediator mediator) =>
        {
            var result = await mediator.Send(new UpdateAgentCommand(
                id, currentUser.UserId, request.Name, request.Description, request.Instructions,
                request.LlmProvider, request.LlmModel, request.ApiKey));
            return Results.Ok(ApiResponse<AgentDto>.Success(result));
        });

        group.MapDelete("/{id:guid}", async (Guid id, ICurrentUser currentUser, IMediator mediator) =>
        {
            await mediator.Send(new DeleteAgentCommand(id, currentUser.UserId));
            return Results.NoContent();
        });

        // Knowledge Sources
        group.MapGet("/{id:guid}/knowledge", async (Guid id, ICurrentUser currentUser, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetKnowledgeSourcesQuery(id, currentUser.UserId));
            return Results.Ok(ApiResponse<IReadOnlyList<KnowledgeSourceDto>>.Success(result));
        });

        group.MapPost("/{id:guid}/knowledge", async (Guid id, AddKnowledgeSourceRequest request, ICurrentUser currentUser, IMediator mediator) =>
        {
            var result = await mediator.Send(new AddKnowledgeSourceCommand(
                id, currentUser.UserId, currentUser.Plan, request.Type, request.Content, request.SourceUrl));
            return Results.Created($"/api/v1/agents/{id}/knowledge/{result.Id}", ApiResponse<KnowledgeSourceDto>.Success(result));
        });

        group.MapDelete("/{agentId:guid}/knowledge/{sourceId:guid}", async (Guid agentId, Guid sourceId, ICurrentUser currentUser, IMediator mediator) =>
        {
            await mediator.Send(new DeleteKnowledgeSourceCommand(sourceId, currentUser.UserId));
            return Results.NoContent();
        });

        return app;
    }
}
