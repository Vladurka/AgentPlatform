using AgentPlatform.Auth.Application.DTOs;
using MediatR;

namespace AgentPlatform.Auth.Application.Commands;

public record RefreshTokenCommand(string RefreshToken) : IRequest<AuthResponse>;
