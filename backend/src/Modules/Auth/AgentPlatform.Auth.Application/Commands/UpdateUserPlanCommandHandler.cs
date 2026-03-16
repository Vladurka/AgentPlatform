using AgentPlatform.Auth.Application.Interfaces;
using AgentPlatform.Shared.Domain;
using MediatR;

namespace AgentPlatform.Auth.Application.Commands;

public record UpdateUserPlanCommand(Guid UserId, string Plan) : IRequest;

public class UpdateUserPlanCommandHandler(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<UpdateUserPlanCommand>
{
    private static readonly HashSet<string> ValidPlans = ["free", "pro", "business"];

    public async Task Handle(UpdateUserPlanCommand request, CancellationToken ct)
    {
        if (!ValidPlans.Contains(request.Plan.ToLower()))
            throw new ArgumentException($"Invalid plan: {request.Plan}");

        var user = await userRepository.GetByIdAsync(request.UserId, ct)
            ?? throw new KeyNotFoundException($"User {request.UserId} not found.");

        user.Plan = request.Plan.ToLower();
        userRepository.Update(user);
        await unitOfWork.SaveChangesAsync(ct);
    }
}
