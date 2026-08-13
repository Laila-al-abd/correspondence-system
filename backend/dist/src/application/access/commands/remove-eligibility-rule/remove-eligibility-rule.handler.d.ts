import { ICommandHandler } from '@nestjs/cqrs';
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository';
import { RemoveEligibilityRuleCommand } from './remove-eligibility-rule.command';
export declare class RemoveEligibilityRuleHandler implements ICommandHandler<RemoveEligibilityRuleCommand, void> {
    private readonly templates;
    constructor(templates: TemplateRepository);
    execute({ input }: RemoveEligibilityRuleCommand): Promise<void>;
}
