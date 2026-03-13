namespace AgentPlatform.Billing.Domain.Entities;

public static class UsagePlan
{
    public static PlanLimits GetLimits(string plan) => plan.ToLowerInvariant() switch
    {
        "free" => new PlanLimits(MaxAgents: 1, MaxSources: 5, MaxMessagesPerMonth: 100),
        "pro" => new PlanLimits(MaxAgents: 10, MaxSources: int.MaxValue, MaxMessagesPerMonth: 5000),
        "business" => new PlanLimits(MaxAgents: int.MaxValue, MaxSources: int.MaxValue, MaxMessagesPerMonth: int.MaxValue),
        _ => throw new ArgumentException($"Unknown plan: {plan}")
    };
}

public record PlanLimits(int MaxAgents, int MaxSources, int MaxMessagesPerMonth);
