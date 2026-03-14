using System.Text;
using AgentPlatform.API.Persistence;
using AgentPlatform.API.Services;
using AgentPlatform.Auth.Endpoints;
using AgentPlatform.Auth.Infrastructure;
using AgentPlatform.Agents.Endpoints;
using AgentPlatform.Agents.Infrastructure;
using AgentPlatform.Agents.Application.Messages;
using AgentPlatform.Agents.Infrastructure.Consumers;
using AgentPlatform.Chat.Endpoints;
using AgentPlatform.Chat.Infrastructure;
using AgentPlatform.Billing.Endpoints;
using AgentPlatform.Billing.Infrastructure;
using AgentPlatform.Shared.Application;
using AgentPlatform.Shared.Domain;
using FluentValidation;
using MassTransit;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// OpenAPI
builder.Services.AddOpenApi();

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<AppDbContext>());
builder.Services.AddScoped<DbContext>(sp => sp.GetRequiredService<AppDbContext>());

// Auth - JWT
var jwtSection = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSection["Issuer"],
        ValidAudience = jwtSection["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Secret"]!)),
        ClockSkew = TimeSpan.Zero
    };
});
builder.Services.AddAuthorization();

// CurrentUser
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();

// Register modules
AuthModuleRegistration.RegisterModule(builder.Services, builder.Configuration);
AgentsModuleRegistration.RegisterModule(builder.Services, builder.Configuration);
ChatModuleRegistration.RegisterModule(builder.Services, builder.Configuration);
BillingModuleRegistration.RegisterModule(builder.Services, builder.Configuration);

// FluentValidation
builder.Services.AddValidatorsFromAssembly(typeof(AgentPlatform.Auth.Application.Commands.RegisterCommand).Assembly);
builder.Services.AddValidatorsFromAssembly(typeof(AgentPlatform.Agents.Application.Commands.CreateAgentCommand).Assembly);
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

// Redis
var redisConn = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
builder.Services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect(redisConn));

// MassTransit + RabbitMQ
var rabbitSection = builder.Configuration.GetSection("RabbitMQ");
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<IngestionStatusConsumer>();

    x.UsingRabbitMq((ctx, cfg) =>
    {
        cfg.Host(rabbitSection["Host"] ?? "localhost", h =>
        {
            h.Username(rabbitSection["Username"] ?? "guest");
            h.Password(rabbitSection["Password"] ?? "guest");
        });

        cfg.ReceiveEndpoint("ingestion.status", e =>
        {
            e.ConfigureConsumer<IngestionStatusConsumer>(ctx);
        });

        cfg.Message<IngestionRequestedEvent>(m => m.SetEntityName("ingestion.requests"));
        cfg.Publish<IngestionRequestedEvent>(p => p.ExchangeType = "direct");
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNameCaseInsensitive = true;
});

var app = builder.Build();

// Auto-migrate on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseMiddleware<AgentPlatform.API.Middleware.ExceptionHandlingMiddleware>();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Map module endpoints
app.MapAuthEndpoints();
app.MapAgentEndpoints();
app.MapChatEndpoints();
app.MapBillingEndpoints();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
