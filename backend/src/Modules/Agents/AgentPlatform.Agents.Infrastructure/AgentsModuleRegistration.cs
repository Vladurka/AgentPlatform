using AgentPlatform.Agents.Application.Interfaces;
using AgentPlatform.Agents.Infrastructure.Repositories;
using AgentPlatform.Shared.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AgentPlatform.Agents.Infrastructure;

public class AgentsModuleRegistration : IModuleRegistration
{
    public static IServiceCollection RegisterModule(IServiceCollection services, IConfiguration configuration)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(
            typeof(Application.Commands.CreateAgentCommand).Assembly));

        services.AddScoped<IAgentRepository, AgentRepository>();
        services.AddScoped<IKnowledgeSourceRepository, KnowledgeSourceRepository>();

        return services;
    }
}
