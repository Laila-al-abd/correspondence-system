import { Repository } from "../../shared/repository"
import { Identifier } from "../../shared/identifier"
import { WorkflowPath } from "../workflow-path"

export interface WorkflowPathRepository extends Repository<WorkflowPath> {
  findActiveByTemplate(templateId: Identifier): Promise<WorkflowPath | null>
  listByTemplate(templateId: Identifier): Promise<WorkflowPath[]>

  /**
   * Flips the activation flag and nothing else.
   *
   * `save()` treats the path as an aggregate and rewrites its whole step graph.
   * That is right for authoring and fatal for a path that requests are already
   * running on: deleting those workflow_steps rows violates
   * request_step_instances_workflow_step_id_fkey, which deliberately has no
   * cascade because step instances are the audit trail. Activation is pure
   * metadata, so it gets its own narrow write.
   */
  setActive(id: Identifier, isActive: boolean): Promise<void>

  /**
   * Makes `pathId` the one active path for `templateId`, atomically.
   *
   * Retiring the incumbent and promoting the replacement are one operation, not
   * two. Done as two writes there is always an instant when the template has
   * either two active paths (which the one_active_workflow_path_per_template
   * index rejects) or none (which strands every request that tries to start).
   */
  activateExclusively(templateId: Identifier, pathId: Identifier): Promise<void>
}
