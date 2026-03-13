using AgentPlatform.Auth.Application.DTOs;
using MediatR;

namespace AgentPlatform.Auth.Application.Queries;

public record GetMeQuery(Guid UserId) : IRequest<UserDto>;
