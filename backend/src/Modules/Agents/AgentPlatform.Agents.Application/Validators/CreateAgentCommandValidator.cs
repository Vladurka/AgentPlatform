using AgentPlatform.Agents.Application.Commands;
using FluentValidation;

namespace AgentPlatform.Agents.Application.Validators;

public class CreateAgentCommandValidator : AbstractValidator<CreateAgentCommand>
{
    public CreateAgentCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Instructions).NotEmpty().MaximumLength(10000);
        RuleFor(x => x.Description).MaximumLength(1000);
    }
}
