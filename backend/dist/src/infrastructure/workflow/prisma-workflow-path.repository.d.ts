import { WorkflowPath } from '../../domain/workflow/workflow-path';
import { WorkflowPathRepository } from '../../domain/workflow/ports/workflow-path.repository';
import { Identifier } from '../../domain/shared/identifier';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaWorkflowPathRepository implements WorkflowPathRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: Identifier): Promise<WorkflowPath | null>;
    findActiveByTemplate(templateId: Identifier): Promise<WorkflowPath | null>;
    listByTemplate(templateId: Identifier): Promise<WorkflowPath[]>;
    save(path: WorkflowPath): Promise<void>;
    setActive(id: Identifier, isActive: boolean): Promise<void>;
    activateExclusively(templateId: Identifier, pathId: Identifier): Promise<void>;
}
