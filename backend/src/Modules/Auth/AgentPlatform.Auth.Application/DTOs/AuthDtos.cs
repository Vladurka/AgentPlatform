namespace AgentPlatform.Auth.Application.DTOs;

public record RegisterRequest(string Email, string Password);
public record LoginRequest(string Email, string Password);
public record RefreshRequest(string RefreshToken);
public record AuthResponse(string AccessToken, string RefreshToken, DateTime ExpiresAt);
public record UserDto(Guid Id, string Email, string Plan, bool IsAdmin, DateTime CreatedAt);
public record AdminUserDto(Guid Id, string Email, string Plan, bool IsAdmin, int AgentCount, DateTime CreatedAt);
public record UpdateUserPlanRequest(string Plan);
