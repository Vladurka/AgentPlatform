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

    public async Task IncrementMessageCountAsync(Guid userId, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var record = await DbSet.FirstOrDefaultAsync(
            u => u.UserId == userId && u.Year == now.Year && u.Month == now.Month, ct);

        if (record is null)
        {
            DbSet.Add(new UsageRecord { UserId = userId, Year = now.Year, Month = now.Month, MessageCount = 1 });
        }
        else
        {
            record.MessageCount++;
        }

        await Context.SaveChangesAsync(ct);
    }
}
