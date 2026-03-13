using AgentPlatform.Auth.Domain.Entities;

namespace AgentPlatform.Auth.Application.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}
