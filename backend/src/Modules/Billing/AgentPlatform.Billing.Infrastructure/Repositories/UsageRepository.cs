using AgentPlatform.Billing.Application.Interfaces;
using AgentPlatform.Billing.Domain.Entities;
using AgentPlatform.Shared.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace AgentPlatform.Billing.Infrastructure.Repositories;

public class UsageRepository(DbContext context) : BaseRepository<UsageRecord>(context), IUsageRepository
{
    public async Task<UsageRecord?> GetCurrentMonthAsync(Guid userId, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        return await DbSet.FirstOrDefaultAsync(
            u => u.UserId == userId && u.Year == now.Year && u.Month == now.Month, ct);
    }
}
