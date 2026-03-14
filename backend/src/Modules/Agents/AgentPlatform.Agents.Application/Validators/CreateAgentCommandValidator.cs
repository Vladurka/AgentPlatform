using AgentPlatform.Agents.Application.Commands;
using AgentPlatform.Agents.Domain.Entities;
using FluentValidation;

namespace AgentPlatform.Agents.Application.Validators;

public class CreateAgentCommandValidator : AbstractValidator<CreateAgentCommand>
{
    public CreateAgentCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Instructions).NotEmpty().MaximumLength(10000);
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.ApiKey).NotEmpty().WithMessage("API key is required.");
        RuleFor(x => x.LlmProvider).IsInEnum().WithMessage("Invalid LLM provider.");
        RuleFor(x => x.LlmModel).IsInEnum().WithMessage("Invalid LLM model.");
        RuleFor(x => x)
            .Must(x => LlmProviderModels.IsCompatible(x.LlmProvider, x.LlmModel))
            .WithMessage(x => $"Model '{x.LlmModel}' is not supported by provider '{x.LlmProvider}'.");
    }
}
