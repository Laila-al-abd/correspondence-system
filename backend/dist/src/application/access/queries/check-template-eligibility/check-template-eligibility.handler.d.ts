import { IQueryHandler } from '@nestjs/cqrs';
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository';
import { EvaluateEligibility, TemplateEligibilityView } from '../../evaluate-eligibility';
import { CheckTemplateEligibilityQuery } from './check-template-eligibility.query';
export declare class CheckTemplateEligibilityHandler implements IQueryHandler<CheckTemplateEligibilityQuery, TemplateEligibilityView> {
    private readonly templates;
    private readonly evaluator;
    constructor(templates: TemplateRepository, evaluator: EvaluateEligibility);
    execute({ userId, templateId, }: CheckTemplateEligibilityQuery): Promise<TemplateEligibilityView>;
}
