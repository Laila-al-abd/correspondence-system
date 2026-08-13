import { ICommandHandler } from '@nestjs/cqrs';
import type { WorkflowPathRepository } from '../../../../domain/workflow/ports/workflow-path.repository';
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository';
import type { ActionTypeRepository } from '../../../../domain/catalog/ports/catalog-lookup.repository';
import type { IdGenerator } from '../../../../domain/shared/id-generator';
import { DefineWorkflowPathCommand } from './define-workflow-path.command';
export interface DefineWorkflowPathResult {
    id: string;
    stepCount: number;
    isActive: boolean;
}
export declare class DefineWorkflowPathHandler implements ICommandHandler<DefineWorkflowPathCommand, DefineWorkflowPathResult> {
    private readonly workflowPaths;
    private readonly templates;
    private readonly actionTypes;
    private readonly ids;
    constructor(workflowPaths: WorkflowPathRepository, templates: TemplateRepository, actionTypes: ActionTypeRepository, ids: IdGenerator);
    execute({ input, }: DefineWorkflowPathCommand): Promise<DefineWorkflowPathResult>;
    private assertTerminalActions;
    private assertUniqueKeys;
}
