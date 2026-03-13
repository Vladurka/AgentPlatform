using AgentPlatform.Billing.Domain.Entities;
using AgentPlatform.Shared.Domain;

namespace AgentPlatform.Billing.Application.Interfaces;

public interface IUsageRepository : IRepository<UsageRecord>
{
    Task<UsageRecord?> GetCurrentMonthAsync(Guid userId, CancellationToken ct = default);
}
