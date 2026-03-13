using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AgentPlatform.Shared.Infrastructure;

public interface IModuleRegistration
{
    static abstract IServiceCollection RegisterModule(IServiceCollection services, IConfiguration configuration);
}
