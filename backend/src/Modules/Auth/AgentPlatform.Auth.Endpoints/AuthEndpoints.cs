using System.Net.Http.Headers;
using System.Text.Json;
using AgentPlatform.Auth.Application.Commands;
using AgentPlatform.Auth.Application.DTOs;
using AgentPlatform.Auth.Application.Queries;
using AgentPlatform.Shared.Application;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;

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

        // ─── Google OAuth ──────────────────────────────────────────────────────────

        group.MapGet("/google", (IConfiguration config) =>
        {
            var clientId = config["OAuth:Google:ClientId"]!;
            var redirectUri = $"{config["OAuth:BackendUrl"]}/api/v1/auth/google/callback";
            var url = "https://accounts.google.com/o/oauth2/v2/auth" +
                      $"?client_id={Uri.EscapeDataString(clientId)}" +
                      $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
                      "&response_type=code&scope=openid%20email%20profile";
            return Results.Redirect(url);
        }).AllowAnonymous();

        group.MapGet("/google/callback", async (
            string? code, string? error,
            IConfiguration config, IMediator mediator, IHttpClientFactory http) =>
        {
            var frontendUrl = config["OAuth:FrontendUrl"]!;
            if (string.IsNullOrEmpty(code) || error is not null)
                return Results.Redirect($"{frontendUrl}/login?error=oauth_cancelled");

            var clientId = config["OAuth:Google:ClientId"]!;
            var clientSecret = config["OAuth:Google:ClientSecret"]!;
            var redirectUri = $"{config["OAuth:BackendUrl"]}/api/v1/auth/google/callback";

            using var client = http.CreateClient();

            var tokenResp = await client.PostAsync("https://oauth2.googleapis.com/token",
                new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["code"] = code,
                    ["client_id"] = clientId,
                    ["client_secret"] = clientSecret,
                    ["redirect_uri"] = redirectUri,
                    ["grant_type"] = "authorization_code",
                }));

            if (!tokenResp.IsSuccessStatusCode)
                return Results.Redirect($"{frontendUrl}/login?error=oauth_failed");

            var tokenDoc = JsonDocument.Parse(await tokenResp.Content.ReadAsStringAsync());
            var accessToken = tokenDoc.RootElement.GetProperty("access_token").GetString()!;

            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            var userResp = await client.GetAsync("https://www.googleapis.com/oauth2/v3/userinfo");
            if (!userResp.IsSuccessStatusCode)
                return Results.Redirect($"{frontendUrl}/login?error=oauth_failed");

            var userDoc = JsonDocument.Parse(await userResp.Content.ReadAsStringAsync());
            var email = userDoc.RootElement.GetProperty("email").GetString()!;

            var auth = await mediator.Send(new OAuthLoginOrRegisterCommand(email, "google"));
            return Results.Redirect(
                $"{frontendUrl}/auth/callback" +
                $"?token={Uri.EscapeDataString(auth.AccessToken)}" +
                $"&refreshToken={Uri.EscapeDataString(auth.RefreshToken)}");
        }).AllowAnonymous();

        // ─── GitHub OAuth ──────────────────────────────────────────────────────────

        group.MapGet("/github", (IConfiguration config) =>
        {
            var clientId = config["OAuth:GitHub:ClientId"]!;
            var redirectUri = $"{config["OAuth:BackendUrl"]}/api/v1/auth/github/callback";
            var url = "https://github.com/login/oauth/authorize" +
                      $"?client_id={Uri.EscapeDataString(clientId)}" +
                      $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
                      "&scope=user%3Aemail";
            return Results.Redirect(url);
        }).AllowAnonymous();

        group.MapGet("/github/callback", async (
            string? code, string? error,
            IConfiguration config, IMediator mediator, IHttpClientFactory http) =>
        {
            var frontendUrl = config["OAuth:FrontendUrl"]!;
            if (string.IsNullOrEmpty(code) || error is not null)
                return Results.Redirect($"{frontendUrl}/login?error=oauth_cancelled");

            var clientId = config["OAuth:GitHub:ClientId"]!;
            var clientSecret = config["OAuth:GitHub:ClientSecret"]!;

            using var client = http.CreateClient();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.UserAgent.ParseAdd("AgentForge/1.0");

            var tokenResp = await client.PostAsync("https://github.com/login/oauth/access_token",
                new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["code"] = code,
                    ["client_id"] = clientId,
                    ["client_secret"] = clientSecret,
                }));

            if (!tokenResp.IsSuccessStatusCode)
                return Results.Redirect($"{frontendUrl}/login?error=oauth_failed");

            var tokenDoc = JsonDocument.Parse(await tokenResp.Content.ReadAsStringAsync());
            var accessToken = tokenDoc.RootElement.GetProperty("access_token").GetString()!;

            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            var emailResp = await client.GetAsync("https://api.github.com/user/emails");
            if (!emailResp.IsSuccessStatusCode)
                return Results.Redirect($"{frontendUrl}/login?error=oauth_failed");

            var emails = JsonDocument.Parse(await emailResp.Content.ReadAsStringAsync()).RootElement.EnumerateArray().ToList();
            var email = (emails.FirstOrDefault(e =>
                            e.TryGetProperty("primary", out var p) && p.GetBoolean() &&
                            e.TryGetProperty("verified", out var v) && v.GetBoolean())
                        .TryGetProperty("email", out var em) ? em.GetString() : null)
                        ?? emails.First().GetProperty("email").GetString()!;

            var auth = await mediator.Send(new OAuthLoginOrRegisterCommand(email, "github"));
            return Results.Redirect(
                $"{frontendUrl}/auth/callback" +
                $"?token={Uri.EscapeDataString(auth.AccessToken)}" +
                $"&refreshToken={Uri.EscapeDataString(auth.RefreshToken)}");
        }).AllowAnonymous();

        return app;
    }
}
