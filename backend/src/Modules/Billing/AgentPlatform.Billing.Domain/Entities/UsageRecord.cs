using AgentPlatform.Shared.Domain;

namespace AgentPlatform.Billing.Domain.Entities;

public class UsageRecord : BaseEntity
{
    public Guid UserId { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public int MessageCount { get; set; }
}
