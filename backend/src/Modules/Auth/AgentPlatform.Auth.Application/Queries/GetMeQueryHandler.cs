using AgentPlatform.Auth.Application.DTOs;
using AgentPlatform.Auth.Application.Interfaces;
using MediatR;

namespace AgentPlatform.Auth.Application.Queries;

public class GetMeQueryHandler(IUserRepository userRepository)
    : IRequestHandler<GetMeQuery, UserDto>
{
    public async Task<UserDto> Handle(GetMeQuery request, CancellationToken ct)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, ct)
            ?? throw new KeyNotFoundException("User not found.");

        return new UserDto(user.Id, user.Email, user.Plan, user.CreatedAt);
    }
}
