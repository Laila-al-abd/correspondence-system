import type { Request } from '../../../domain/request/request';
import type { Template } from '../../../domain/catalog/template';
import { EvaluateEligibility } from '../../access/evaluate-eligibility';
export declare class TemplateSubmissionPolicy {
    private readonly eligibility;
    constructor(eligibility: EvaluateEligibility);
    assertMayBeClassifiedAs(request: Request, template: Template): Promise<void>;
}
