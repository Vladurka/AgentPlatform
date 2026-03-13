using AgentPlatform.Chat.Application.Interfaces;
using AgentPlatform.Chat.Infrastructure.Repositories;
using AgentPlatform.Chat.Infrastructure.Services;
using AgentPlatform.Shared.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AgentPlatform.Chat.Infrastructure;

public class ChatModuleRegistration : IModuleRegistration
{
    public static IServiceCollection RegisterModule(IServiceCollection services, IConfiguration configuration)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(
            typeof(Application.Commands.SendMessageCommand).Assembly));

        services.AddScoped<IConversationRepository, ConversationRepository>();
        services.AddHttpClient<IAiServiceClient, AiServiceClient>();

        return services;
    }
}
