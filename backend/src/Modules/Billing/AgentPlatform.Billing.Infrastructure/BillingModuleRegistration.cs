using AgentPlatform.Billing.Application.Interfaces;
using AgentPlatform.Billing.Infrastructure.Repositories;
using AgentPlatform.Billing.Infrastructure.Services;
using AgentPlatform.Shared.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stripe;

namespace AgentPlatform.Billing.Infrastructure;

public class BillingModuleRegistration : IModuleRegistration
{
    public static IServiceCollection RegisterModule(IServiceCollection services, IConfiguration configuration)
    {
        StripeConfiguration.ApiKey = configuration["Stripe:SecretKey"];

        services.AddScoped<IUsageRepository, UsageRepository>();
        services.AddScoped<IBillingUserRepository, BillingUserRepository>();
        services.AddScoped<IStripeService, StripeService>();

        return services;
    }
}
