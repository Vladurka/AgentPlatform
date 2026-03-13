using AgentPlatform.Billing.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stripe;
using Stripe.Checkout;

namespace AgentPlatform.Billing.Infrastructure.Services;

public class StripeService : IStripeService
{
    private readonly IBillingUserRepository _userRepository;
    private readonly ILogger<StripeService> _logger;
    private readonly string _webhookSecret;
    private readonly string _proPriceId;
    private readonly string _businessPriceId;
    private readonly string _frontendUrl;

    public StripeService(
        IBillingUserRepository userRepository,
        IConfiguration configuration,
        ILogger<StripeService> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
        _webhookSecret = configuration["Stripe:WebhookSecret"]!;
        _proPriceId = configuration["Stripe:ProPriceId"]!;
        _businessPriceId = configuration["Stripe:BusinessPriceId"]!;
        _frontendUrl = configuration["Frontend:BaseUrl"] ?? "http://localhost:3000";
    }

    public async Task<string> CreateCheckoutSessionAsync(
        string plan, Guid userId, string email,
        string? stripeCustomerId, CancellationToken ct = default)
    {
        var priceId = plan.ToLower() switch
        {
            "pro" => _proPriceId,
            "business" => _businessPriceId,
            _ => throw new ArgumentException($"Invalid plan: {plan}")
        };

        var options = new SessionCreateOptions
        {
            Mode = "subscription",
            LineItems = [new SessionLineItemOptions { Price = priceId, Quantity = 1 }],
            SuccessUrl = $"{_frontendUrl}/dashboard?upgrade=success",
            CancelUrl = $"{_frontendUrl}/dashboard?upgrade=cancelled",
            ClientReferenceId = userId.ToString(),
            Metadata = new Dictionary<string, string> { ["plan"] = plan, ["userId"] = userId.ToString() },
        };

        if (stripeCustomerId is not null)
            options.Customer = stripeCustomerId;
        else
            options.CustomerEmail = email;

        var service = new SessionService();
        var session = await service.CreateAsync(options, cancellationToken: ct);
        return session.Url;
    }

    public async Task HandleWebhookAsync(string payload, string stripeSignature, CancellationToken ct = default)
    {
        Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(payload, stripeSignature, _webhookSecret);
        }
        catch (StripeException ex)
        {
            _logger.LogWarning("Stripe webhook signature validation failed: {Message}", ex.Message);
            throw new UnauthorizedAccessException("Invalid Stripe signature.");
        }

        switch (stripeEvent.Type)
        {
            case EventTypes.CheckoutSessionCompleted:
                await HandleCheckoutCompletedAsync(stripeEvent, ct);
                break;

            case EventTypes.CustomerSubscriptionDeleted:
                await HandleSubscriptionDeletedAsync(stripeEvent, ct);
                break;

            case EventTypes.CustomerSubscriptionUpdated:
                await HandleSubscriptionUpdatedAsync(stripeEvent, ct);
                break;

            default:
                _logger.LogDebug("Unhandled Stripe event type: {Type}", stripeEvent.Type);
                break;
        }
    }

    private async Task HandleCheckoutCompletedAsync(Event stripeEvent, CancellationToken ct)
    {
        var session = (Session)stripeEvent.Data.Object;
        if (!Guid.TryParse(session.ClientReferenceId, out var userId)) return;

        var plan = session.Metadata.GetValueOrDefault("plan", "free");
        _logger.LogInformation("Checkout completed: userId={UserId}, plan={Plan}", userId, plan);

        await _userRepository.UpdateStripeInfoAsync(userId, plan, session.CustomerId, session.SubscriptionId, ct);
    }

    private async Task HandleSubscriptionDeletedAsync(Event stripeEvent, CancellationToken ct)
    {
        var subscription = (Subscription)stripeEvent.Data.Object;
        var user = await _userRepository.GetByStripeCustomerIdAsync(subscription.CustomerId, ct);
        if (user is null) return;

        _logger.LogInformation("Subscription cancelled for userId={UserId}", user.Id);
        await _userRepository.UpdateStripeInfoAsync(user.Id, "free", user.StripeCustomerId, null, ct);
    }

    private async Task HandleSubscriptionUpdatedAsync(Event stripeEvent, CancellationToken ct)
    {
        var subscription = (Subscription)stripeEvent.Data.Object;
        var user = await _userRepository.GetByStripeCustomerIdAsync(subscription.CustomerId, ct);
        if (user is null) return;

        var priceId = subscription.Items.Data.FirstOrDefault()?.Price.Id;
        var plan = priceId switch
        {
            var p when p == _proPriceId => "pro",
            var p when p == _businessPriceId => "business",
            _ => "free"
        };

        _logger.LogInformation("Subscription updated for userId={UserId}, plan={Plan}", user.Id, plan);
        await _userRepository.UpdateStripeInfoAsync(user.Id, plan, user.StripeCustomerId, subscription.Id, ct);
    }
}
