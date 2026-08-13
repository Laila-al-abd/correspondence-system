import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { WorkflowPathView } from '../../application/workflow/queries/views/workflow-path.view';
import { DefineWorkflowPathDto } from './dto/define-workflow-path.dto';
export declare class WorkflowController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    listByTemplate(templateId: string): Promise<WorkflowPathView[]>;
    get(id: string): Promise<WorkflowPathView>;
    define(dto: DefineWorkflowPathDto): Promise<{
        id: string;
        stepCount: number;
        isActive: boolean;
    }>;
    activate(id: string): Promise<{
        id: string;
        isActive: boolean;
    }>;
    deactivate(id: string): Promise<{
        id: string;
        isActive: boolean;
    }>;
}
