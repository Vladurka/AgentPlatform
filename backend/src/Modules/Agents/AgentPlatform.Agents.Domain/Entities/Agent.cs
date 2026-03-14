using AgentPlatform.Shared.Domain;

namespace AgentPlatform.Agents.Domain.Entities;

public class Agent : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Instructions { get; set; } = string.Empty; // system prompt
    public Guid OwnerId { get; set; }
    public string EmbedToken { get; set; } = Guid.NewGuid().ToString("N");
    public AgentStatus Status { get; set; } = AgentStatus.Active;
    public LlmProvider LlmProvider { get; set; } = LlmProvider.OpenAi;
    public LlmModel LlmModel { get; set; } = LlmModel.Gpt4oMini;
    public string ApiKeyEncrypted { get; set; } = string.Empty;

    public ICollection<KnowledgeSource> KnowledgeSources { get; set; } = [];
}

public enum AgentStatus
{
    Active,
    Inactive,
    Training
}

public enum LlmProvider
{
    OpenAi,
    Anthropic,
    Gemini
}

public enum LlmModel
{
    // OpenAI
    Gpt4o,
    Gpt4oMini,
    // Anthropic
    Claude35Sonnet,
    Claude3Haiku,
    // Gemini
    Gemini15Pro,
    Gemini15Flash
}

public static class LlmProviderModels
{
    private static readonly Dictionary<LlmProvider, HashSet<LlmModel>> Allowed = new()
    {
        [LlmProvider.OpenAi]    = [LlmModel.Gpt4o, LlmModel.Gpt4oMini],
        [LlmProvider.Anthropic] = [LlmModel.Claude35Sonnet, LlmModel.Claude3Haiku],
        [LlmProvider.Gemini]    = [LlmModel.Gemini15Pro, LlmModel.Gemini15Flash],
    };

    public static bool IsCompatible(LlmProvider provider, LlmModel model)
        => Allowed.TryGetValue(provider, out var models) && models.Contains(model);
}
