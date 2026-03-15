using AgentPlatform.Auth.Application.DTOs;
using AgentPlatform.Auth.Application.Interfaces;
using AgentPlatform.Auth.Domain.Entities;
using AgentPlatform.Shared.Domain;
using MediatR;

namespace AgentPlatform.Auth.Application.Commands;

public class OAuthLoginOrRegisterCommandHandler(
    IUserRepository userRepository,
    ITokenService tokenService,
    IUnitOfWork unitOfWork) : IRequestHandler<OAuthLoginOrRegisterCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(OAuthLoginOrRegisterCommand request, CancellationToken ct)
    {
        var email = request.Email.ToLowerInvariant();
        var user = await userRepository.GetByEmailAsync(email, ct);

        if (user is null)
        {
            user = new User
            {
                Email = email,
                PasswordHash = string.Empty, // no password for OAuth users
                ApiKey = Guid.NewGuid().ToString("N"),
            };
            await userRepository.AddAsync(user, ct);
        }

        var refreshToken = tokenService.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

        await unitOfWork.SaveChangesAsync(ct);

        var accessToken = tokenService.GenerateAccessToken(user);
        return new AuthResponse(accessToken, refreshToken, DateTime.UtcNow.AddHours(1));
    }
}
