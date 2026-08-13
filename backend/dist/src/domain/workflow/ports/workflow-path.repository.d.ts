import { Repository } from "../../shared/repository";
import { Identifier } from "../../shared/identifier";
import { WorkflowPath } from "../workflow-path";
export interface WorkflowPathRepository extends Repository<WorkflowPath> {
    findActiveByTemplate(templateId: Identifier): Promise<WorkflowPath | null>;
    listByTemplate(templateId: Identifier): Promise<WorkflowPath[]>;
    setActive(id: Identifier, isActive: boolean): Promise<void>;
    activateExclusively(templateId: Identifier, pathId: Identifier): Promise<void>;
}
