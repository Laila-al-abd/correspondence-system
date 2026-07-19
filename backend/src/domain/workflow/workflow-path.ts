import { AggregateRoot } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"
import { InvariantViolationError } from "../shared/domain-error"
import { WorkflowStep } from "./workflow-step"

interface WorkflowPathProps {
  templateId: Identifier
  name: LocalizedText
  description?: LocalizedText
  isActive: boolean
  steps: WorkflowStep[]
}

/**
 * An ordered set of steps (a DAG) that a request of a given template follows.
 * The aggregate owns its steps and guarantees the graph is acyclic, that every
 * dependency points at a real step in the same path, and that there is an entry
 * point before it can be activated.
 */
export class WorkflowPath extends AggregateRoot {
  private constructor(id: Identifier, private props: WorkflowPathProps) {
    super(id)
  }

  static create(
    id: Identifier,
    p: { templateId: Identifier; name: LocalizedText; description?: LocalizedText },
  ): WorkflowPath {
    return new WorkflowPath(id, { ...p, isActive: true, steps: [] })
  }

  static rehydrate(id: Identifier, props: WorkflowPathProps): WorkflowPath {
    return new WorkflowPath(id, props)
  }

  addStep(step: WorkflowStep): void { this.props.steps.push(step) }

  activate(): void {
    this.assertValidGraph()
    this.props.isActive = true
  }
  deactivate(): void { this.props.isActive = false }

  get steps(): readonly WorkflowStep[] { return this.props.steps }
  get isActive(): boolean { return this.props.isActive }
  get templateId(): Identifier { return this.props.templateId }

  /** Entry steps have no dependencies — a request begins here. */
  entrySteps(): WorkflowStep[] {
    return this.props.steps.filter((s) => s.dependencyIds.length === 0)
  }

  /**
   * Validates that every dependency references a known step and that the graph
   * has no cycles. Uses Kahn's algorithm: a topological sort must be able to
   * consume every node, otherwise a cycle exists.
   */
  assertValidGraph(): void {
    if (this.props.steps.length === 0)
      throw new InvariantViolationError("A workflow path must have at least one step.")

    const ids = new Set(this.props.steps.map((s) => s.id.toString()))
    for (const step of this.props.steps)
      for (const dep of step.dependencyIds)
        if (!ids.has(dep))
          throw new InvariantViolationError(`Step depends on unknown step "${dep}".`)

    const indegree = new Map<string, number>()
    const dependents = new Map<string, string[]>()
    for (const s of this.props.steps) indegree.set(s.id.toString(), 0)
    for (const s of this.props.steps) {
      const self = s.id.toString()
      for (const dep of s.dependencyIds) {
        indegree.set(self, (indegree.get(self) ?? 0) + 1)
        dependents.set(dep, [...(dependents.get(dep) ?? []), self])
      }
    }

    const queue = [...indegree.entries()].filter(([, d]) => d === 0).map(([id]) => id)
    let visited = 0
    while (queue.length > 0) {
      const current = queue.shift() as string
      visited++
      for (const next of dependents.get(current) ?? []) {
        indegree.set(next, (indegree.get(next) ?? 0) - 1)
        if (indegree.get(next) === 0) queue.push(next)
      }
    }
    if (visited !== this.props.steps.length)
      throw new InvariantViolationError("Workflow path contains a dependency cycle.")
    if (this.entrySteps().length === 0)
      throw new InvariantViolationError("Workflow path has no entry step.")
  }

  /** Dependency adjacency (stepId -> its prerequisite stepIds), for runtime use. */
  dependencyMap(): Map<string, string[]> {
    return new Map(this.props.steps.map((s) => [s.id.toString(), s.dependencyIds]))
  }
}
