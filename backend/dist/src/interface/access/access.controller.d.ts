import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TemplateEligibilityView } from '../../application/access/evaluate-eligibility';
import { EligibleTemplateView } from '../../application/access/queries/views/eligible-template.view';
import { AttributeDefinitionView } from '../../application/access/queries/views/attribute-definition.view';
import { EligibilityRuleView } from '../../application/access/queries/views/eligibility-rule.view';
import { AddEligibilityRuleDto } from './dto/add-eligibility-rule.dto';
import { CreateAttributeDefinitionDto } from './dto/create-attribute-definition.dto';
export declare class AccessController {
    private readonly queryBus;
    private readonly commandBus;
    constructor(queryBus: QueryBus, commandBus: CommandBus);
    attributes(): Promise<AttributeDefinitionView[]>;
    createAttribute(dto: CreateAttributeDefinitionDto): Promise<AttributeDefinitionView>;
    eligibleTemplates(userId: string): Promise<EligibleTemplateView[]>;
    checkEligibility(userId: string, templateId: string): Promise<TemplateEligibilityView>;
    listRules(templateId: string): Promise<EligibilityRuleView[]>;
    addRule(templateId: string, dto: AddEligibilityRuleDto): Promise<EligibilityRuleView>;
    removeRule(templateId: string, ruleId: string): Promise<void>;
}
