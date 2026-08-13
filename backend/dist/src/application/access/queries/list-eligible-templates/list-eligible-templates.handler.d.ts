import { IQueryHandler } from '@nestjs/cqrs';
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository';
import { EvaluateEligibility } from '../../evaluate-eligibility';
import { EligibleTemplateView } from '../views/eligible-template.view';
import { ListEligibleTemplatesQuery } from './list-eligible-templates.query';
export declare class ListEligibleTemplatesHandler implements IQueryHandler<ListEligibleTemplatesQuery, EligibleTemplateView[]> {
    private readonly templates;
    private readonly evaluator;
    constructor(templates: TemplateRepository, evaluator: EvaluateEligibility);
    execute({ userId, }: ListEligibleTemplatesQuery): Promise<EligibleTemplateView[]>;
}
