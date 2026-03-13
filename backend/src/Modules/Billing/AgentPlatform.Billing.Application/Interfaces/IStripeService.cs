namespace AgentPlatform.Billing.Application.Interfaces;

public interface IStripeService
{
    Task<string> CreateCheckoutSessionAsync(
        string plan, Guid userId, string email,
        string? stripeCustomerId, CancellationToken ct = default);

    Task HandleWebhookAsync(string payload, string stripeSignature, CancellationToken ct = default);
}
