namespace AgentPlatform.Shared.Application;

public interface ICurrentUser
{
    Guid UserId { get; }
    string Email { get; }
    string Plan { get; }
    bool IsAuthenticated { get; }
}
