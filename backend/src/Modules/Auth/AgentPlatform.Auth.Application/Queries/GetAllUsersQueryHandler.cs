using AgentPlatform.Auth.Application.DTOs;
using AgentPlatform.Auth.Application.Interfaces;
using AgentPlatform.Agents.Application.Interfaces;
using MediatR;

namespace AgentPlatform.Auth.Application.Queries;

public record GetAllUsersQuery : IRequest<List<AdminUserDto>>;

public class GetAllUsersQueryHandler(
    IUserRepository userRepository,
    IAgentRepository agentRepository) : IRequestHandler<GetAllUsersQuery, List<AdminUserDto>>
{
    public async Task<List<AdminUserDto>> Handle(GetAllUsersQuery request, CancellationToken ct)
    {
        var users = await userRepository.GetAllAsync(ct);
        var result = new List<AdminUserDto>();

        foreach (var user in users)
        {
            var agents = await agentRepository.GetByOwnerIdAsync(user.Id, ct);
            result.Add(new AdminUserDto(user.Id, user.Email, user.Plan, user.IsAdmin, agents.Count, user.CreatedAt));
        }

        return result;
    }
}
