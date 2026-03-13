using AgentPlatform.Auth.Application.DTOs;
using MediatR;

namespace AgentPlatform.Auth.Application.Commands;

public record RegisterCommand(string Email, string Password) : IRequest<AuthResponse>;
