using AgentPlatform.Auth.Application.DTOs;
using MediatR;

namespace AgentPlatform.Auth.Application.Commands;

public record LoginCommand(string Email, string Password) : IRequest<AuthResponse>;
