using AgentPlatform.Auth.Domain.Entities;
using AgentPlatform.Billing.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AgentPlatform.Billing.Infrastructure.Repositories;

public class BillingUserRepository(DbContext context) : IBillingUserRepository
{
    private DbSet<User> Users => context.Set<User>();

    public async Task<BillingUser?> GetByIdAsync(Guid userId, CancellationToken ct = default)
        => await Users
            .Where(u => u.Id == userId)
            .Select(u => new BillingUser(u.Id, u.Email, u.Plan, u.StripeCustomerId, u.StripeSubscriptionId))
            .FirstOrDefaultAsync(ct);

    public async Task<BillingUser?> GetByStripeCustomerIdAsync(string customerId, CancellationToken ct = default)
        => await Users
            .Where(u => u.StripeCustomerId == customerId)
            .Select(u => new BillingUser(u.Id, u.Email, u.Plan, u.StripeCustomerId, u.StripeSubscriptionId))
            .FirstOrDefaultAsync(ct);

    public async Task UpdateStripeInfoAsync(
        Guid userId, string plan,
        string? stripeCustomerId, string? stripeSubscriptionId,
        CancellationToken ct = default)
        => await Users
            .Where(u => u.Id == userId)
            .ExecuteUpdateAsync(s => s
                .SetProperty(u => u.Plan, plan)
                .SetProperty(u => u.StripeCustomerId, stripeCustomerId)
                .SetProperty(u => u.StripeSubscriptionId, stripeSubscriptionId)
                .SetProperty(u => u.UpdatedAt, DateTime.UtcNow), ct);
}
