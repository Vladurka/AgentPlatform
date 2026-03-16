using AgentPlatform.Auth.Application.Commands;
using AgentPlatform.Auth.Application.DTOs;
using AgentPlatform.Auth.Application.Queries;
using AgentPlatform.Shared.Application;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace AgentPlatform.Auth.Endpoints;

public static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/admin").WithTags("Admin").RequireAuthorization("Admin");

        // GET /api/v1/admin/users
        group.MapGet("/users", async (IMediator mediator) =>
        {
            var users = await mediator.Send(new GetAllUsersQuery());
            return Results.Ok(ApiResponse<List<AdminUserDto>>.Success(users));
        });

        // PUT /api/v1/admin/users/{id}/plan
        group.MapPut("/users/{id:guid}/plan", async (Guid id, UpdateUserPlanRequest request, IMediator mediator) =>
        {
            await mediator.Send(new UpdateUserPlanCommand(id, request.Plan));
            return Results.Ok(ApiResponse<object>.Success(new { updated = true }));
        });

        return app;
    }
}
