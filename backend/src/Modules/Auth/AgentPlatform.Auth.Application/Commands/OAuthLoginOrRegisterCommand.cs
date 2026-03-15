using AgentPlatform.Auth.Application.DTOs;
using MediatR;

namespace AgentPlatform.Auth.Application.Commands;

public record OAuthLoginOrRegisterCommand(string Email, string Provider) : IRequest<AuthResponse>;
