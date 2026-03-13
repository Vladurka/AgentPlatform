using AgentPlatform.Auth.Application.DTOs;
using AgentPlatform.Auth.Application.Interfaces;
using AgentPlatform.Auth.Domain.Entities;
using AgentPlatform.Shared.Domain;
using MediatR;

namespace AgentPlatform.Auth.Application.Commands;

public class RegisterCommandHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    ITokenService tokenService,
    IUnitOfWork unitOfWork) : IRequestHandler<RegisterCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken ct)
    {
        if (await userRepository.ExistsAsync(request.Email, ct))
            throw new InvalidOperationException("User with this email already exists.");

        var user = new User
        {
            Email = request.Email.ToLowerInvariant(),
            PasswordHash = passwordHasher.Hash(request.Password),
            ApiKey = Guid.NewGuid().ToString("N")
        };

        var refreshToken = tokenService.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

        await userRepository.AddAsync(user, ct);
        await unitOfWork.SaveChangesAsync(ct);

        var accessToken = tokenService.GenerateAccessToken(user);
        return new AuthResponse(accessToken, refreshToken, DateTime.UtcNow.AddHours(1));
    }
}
