using AgentPlatform.Auth.Application.Commands;
using AgentPlatform.Auth.Application.DTOs;
using AgentPlatform.Auth.Application.Queries;
using AgentPlatform.Shared.Application;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace AgentPlatform.Auth.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/auth").WithTags("Auth");

        group.MapPost("/register", async (RegisterRequest request, IMediator mediator) =>
        {
            var result = await mediator.Send(new RegisterCommand(request.Email, request.Password));
            return Results.Ok(ApiResponse<AuthResponse>.Success(result));
        }).AllowAnonymous();

        group.MapPost("/login", async (LoginRequest request, IMediator mediator) =>
        {
            var result = await mediator.Send(new LoginCommand(request.Email, request.Password));
            return Results.Ok(ApiResponse<AuthResponse>.Success(result));
        }).AllowAnonymous();

        group.MapPost("/refresh", async (RefreshRequest request, IMediator mediator) =>
        {
            var result = await mediator.Send(new RefreshTokenCommand(request.RefreshToken));
            return Results.Ok(ApiResponse<AuthResponse>.Success(result));
        }).AllowAnonymous();

        group.MapGet("/me", async (ICurrentUser currentUser, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetMeQuery(currentUser.UserId));
            return Results.Ok(ApiResponse<UserDto>.Success(result));
        }).RequireAuthorization();

        return app;
    }
}
