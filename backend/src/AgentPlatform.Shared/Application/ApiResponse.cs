namespace AgentPlatform.Shared.Application;

public record ApiResponse<T>(T? Data, string? Error = null, object? Meta = null)
{
    public static ApiResponse<T> Success(T data, object? meta = null) => new(data, null, meta);
    public static ApiResponse<T> Fail(string error) => new(default, error);
}

public record ApiResponse(string? Error = null)
{
    public static ApiResponse Success() => new();
    public static ApiResponse Fail(string error) => new(error);
}
