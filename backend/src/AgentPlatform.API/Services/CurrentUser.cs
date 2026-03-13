using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AgentPlatform.Shared.Application;

namespace AgentPlatform.API.Services;

public class CurrentUser(IHttpContextAccessor httpContextAccessor) : ICurrentUser
{
    private readonly ClaimsPrincipal? _user = httpContextAccessor.HttpContext?.User;

    public Guid UserId => Guid.Parse(
        _user?.FindFirstValue(JwtRegisteredClaimNames.Sub)
        ?? _user?.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("User not authenticated."));

    public string Email =>
        _user?.FindFirstValue(JwtRegisteredClaimNames.Email)
        ?? _user?.FindFirstValue(ClaimTypes.Email)
        ?? string.Empty;

    public string Plan =>
        _user?.FindFirstValue("plan") ?? "free";

    public bool IsAuthenticated =>
        _user?.Identity?.IsAuthenticated ?? false;
}
