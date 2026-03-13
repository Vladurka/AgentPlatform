namespace AgentPlatform.Billing.Application.DTOs;

public record UsageDto(string Plan, int MessagesUsed, int MessagesLimit, int AgentsUsed, int AgentsLimit);
public record CheckoutSessionDto(string Url);
