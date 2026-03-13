using AgentPlatform.Auth.Application.Interfaces;
using AgentPlatform.Auth.Infrastructure.Repositories;
using AgentPlatform.Auth.Infrastructure.Services;
using AgentPlatform.Shared.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AgentPlatform.Auth.Infrastructure;

public class AuthModuleRegistration : IModuleRegistration
{
    public static IServiceCollection RegisterModule(IServiceCollection services, IConfiguration configuration)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(
            typeof(Application.Commands.RegisterCommand).Assembly));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<ITokenService, TokenService>();

        return services;
    }
}
