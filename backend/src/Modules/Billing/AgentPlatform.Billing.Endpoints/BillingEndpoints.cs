using AgentPlatform.Billing.Application.DTOs;
using AgentPlatform.Billing.Application.Interfaces;
using AgentPlatform.Billing.Domain.Entities;
using AgentPlatform.Shared.Application;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace AgentPlatform.Billing.Endpoints;

public static class BillingEndpoints
{
    public static IEndpointRouteBuilder MapBillingEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/billing").WithTags("Billing").RequireAuthorization();

        // GET /billing/usage
        group.MapGet("/usage", async (ICurrentUser currentUser, IUsageRepository usageRepository, CancellationToken ct) =>
        {
            var usage = await usageRepository.GetCurrentMonthAsync(currentUser.UserId, ct);
            var limits = UsagePlan.GetLimits(currentUser.Plan);

            var dto = new UsageDto(
                Plan: currentUser.Plan,
                MessagesUsed: usage?.MessageCount ?? 0,
                MessagesLimit: limits.MaxMessagesPerMonth == int.MaxValue ? -1 : limits.MaxMessagesPerMonth,
                AgentsUsed: 0,
                AgentsLimit: limits.MaxAgents == int.MaxValue ? -1 : limits.MaxAgents
            );

            return Results.Ok(ApiResponse<UsageDto>.Success(dto));
        });

        // POST /billing/checkout/{plan}  — создаёт Stripe Checkout Session, возвращает URL
        group.MapPost("/checkout/{plan}", async (
            string plan,
            ICurrentUser currentUser,
            IBillingUserRepository userRepo,
            IStripeService stripeService,
            CancellationToken ct) =>
        {
            var user = await userRepo.GetByIdAsync(currentUser.UserId, ct);
            if (user is null) return Results.NotFound();

            var url = await stripeService.CreateCheckoutSessionAsync(
                plan, user.Id, user.Email, user.StripeCustomerId, ct);

            return Results.Ok(ApiResponse<CheckoutSessionDto>.Success(new CheckoutSessionDto(url)));
        });

        // POST /billing/webhook  — Stripe webhook (без авторизации, нужен raw body)
        app.MapPost("/api/v1/billing/webhook", async (
            HttpRequest request,
            IStripeService stripeService,
            CancellationToken ct) =>
        {
            var payload = await new StreamReader(request.Body).ReadToEndAsync(ct);
            var signature = request.Headers["Stripe-Signature"].ToString();

            await stripeService.HandleWebhookAsync(payload, signature, ct);
            return Results.Ok();
        }).AllowAnonymous();

        return app;
    }
}
