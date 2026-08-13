import { ICommandHandler } from '@nestjs/cqrs';
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository';
import type { AttributeDefinitionRepository } from '../../../../domain/catalog/ports/attribute-definition.repository';
import type { IdGenerator } from '../../../../domain/shared/id-generator';
import { EligibilityRuleView } from '../../queries/views/eligibility-rule.view';
import { AddEligibilityRuleCommand } from './add-eligibility-rule.command';
export declare class AddEligibilityRuleHandler implements ICommandHandler<AddEligibilityRuleCommand, EligibilityRuleView> {
    private readonly templates;
    private readonly attributes;
    private readonly ids;
    constructor(templates: TemplateRepository, attributes: AttributeDefinitionRepository, ids: IdGenerator);
    execute({ input, }: AddEligibilityRuleCommand): Promise<EligibilityRuleView>;
}
