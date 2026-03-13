namespace AgentPlatform.Billing.Application.Interfaces;

public record BillingUser(Guid Id, string Email, string Plan, string? StripeCustomerId, string? StripeSubscriptionId);

public interface IBillingUserRepository
{
    Task<BillingUser?> GetByIdAsync(Guid userId, CancellationToken ct = default);
    Task<BillingUser?> GetByStripeCustomerIdAsync(string customerId, CancellationToken ct = default);
    Task UpdateStripeInfoAsync(Guid userId, string plan, string? stripeCustomerId, string? stripeSubscriptionId, CancellationToken ct = default);
}
