import { IQueryHandler } from '@nestjs/cqrs';
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository';
import type { AttributeDefinitionRepository } from '../../../../domain/catalog/ports/attribute-definition.repository';
import { EligibilityRuleView } from '../views/eligibility-rule.view';
import { ListEligibilityRulesQuery } from './list-eligibility-rules.query';
export declare class ListEligibilityRulesHandler implements IQueryHandler<ListEligibilityRulesQuery, EligibilityRuleView[]> {
    private readonly templates;
    private readonly attributes;
    constructor(templates: TemplateRepository, attributes: AttributeDefinitionRepository);
    execute({ templateId, }: ListEligibilityRulesQuery): Promise<EligibilityRuleView[]>;
}
