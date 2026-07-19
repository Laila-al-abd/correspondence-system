import { AggregateRoot } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { InvariantViolationError } from "../shared/domain-error"
import { RequestStepInstance } from "./request-step-instance"
import {
  ClassificationStatus,
  ClassifiedBy,
  Priority,
  RequestStatus,
  StepInstanceStatus,
} from "./enums"

interface RequestProps {
  requesterId: Identifier
  rawText?: string
  templateId?: Identifier
  workflowPathId?: Identifier
  filledData: Record<string, unknown>
  classificationStatus: ClassificationStatus
  classificationConfidence?: number
  classifiedBy?: ClassifiedBy
  currentStatus: RequestStatus
  priority: Priority
  sensitivityLevelId?: Identifier
  slaDueAt?: Date
  completedAt?: Date
  stepInstances: RequestStepInstance[]
}

/** Allowed transitions for the request lifecycle state machine. */
const TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  [RequestStatus.DRAFT]: [RequestStatus.IN_PROGRESS, RequestStatus.CANCELLED],
  [RequestStatus.IN_PROGRESS]: [
    RequestStatus.ON_HOLD,
    RequestStatus.COMPLETED,
    RequestStatus.REJECTED,
    RequestStatus.CANCELLED,
  ],
  [RequestStatus.ON_HOLD]: [RequestStatus.IN_PROGRESS, RequestStatus.CANCELLED],
  [RequestStatus.COMPLETED]: [],
  [RequestStatus.REJECTED]: [],
  [RequestStatus.CANCELLED]: [],
}

/**
 * The central aggregate: a correspondence request moving through classification
 * and then a workflow. It guards the classification -> routing -> execution
 * lifecycle and exposes which steps are ready to run (dependency-aware).
 */
export class Request extends AggregateRoot {
  private constructor(id: Identifier, private props: RequestProps) {
    super(id)
  }

  static create(
    id: Identifier,
    p: { requesterId: Identifier; rawText?: string; priority?: Priority },
  ): Request {
    return new Request(id, {
      requesterId: p.requesterId,
      rawText: p.rawText,
      filledData: {},
      classificationStatus: ClassificationStatus.PENDING,
      currentStatus: RequestStatus.DRAFT,
      priority: p.priority ?? Priority.NORMAL,
      stepInstances: [],
    })
  }

  static rehydrate(id: Identifier, props: RequestProps): Request {
    return new Request(id, props)
  }

  // ----- classification -----

  /**
   * Apply an automatic (NLP) classification. Below the confidence threshold the
   * request is flagged for human-in-the-loop review rather than trusted.
   */
  classifyByModel(templateId: Identifier, confidence: number, threshold = 0.8): void {
    if (this.props.currentStatus !== RequestStatus.DRAFT)
      throw new InvariantViolationError("Only draft requests can be classified.")
    this.props.templateId = templateId
    this.props.classificationConfidence = confidence
    this.props.classifiedBy = ClassifiedBy.NLP
    this.props.classificationStatus =
      confidence >= threshold ? ClassificationStatus.CLASSIFIED : ClassificationStatus.HITL
  }

  /** A human resolves or overrides the classification (HITL). */
  classifyByHuman(templateId: Identifier): void {
    this.props.templateId = templateId
    this.props.classifiedBy = ClassifiedBy.HITL
    this.props.classificationStatus = ClassificationStatus.CLASSIFIED
  }

  setFilledData(data: Record<string, unknown>): void {
    if (this.props.currentStatus !== RequestStatus.DRAFT)
      throw new InvariantViolationError("Form data can only change while the request is a draft.")
    this.props.filledData = data
  }

  setSensitivity(levelId: Identifier): void { this.props.sensitivityLevelId = levelId }
  changePriority(priority: Priority): void { this.props.priority = priority }

  // ----- routing & execution -----

  /**
   * Attach a workflow path and its runtime step instances, then move to
   * IN_PROGRESS. Requires the request to be classified first.
   */
  startWorkflow(workflowPathId: Identifier, stepInstances: RequestStepInstance[]): void {
    if (this.props.classificationStatus !== ClassificationStatus.CLASSIFIED)
      throw new InvariantViolationError("Cannot start a workflow before the request is classified.")
    if (!this.props.templateId)
      throw new InvariantViolationError("Cannot start a workflow without a template.")
    if (stepInstances.length === 0)
      throw new InvariantViolationError("A workflow must have at least one step.")
    this.props.workflowPathId = workflowPathId
    this.props.stepInstances = stepInstances
    this.transitionTo(RequestStatus.IN_PROGRESS)
  }

  /**
   * Steps that are still pending and whose dependencies have all reached a
   * terminal-satisfied state (DONE or SKIPPED) — i.e. the work that can begin
   * now. `dependencyMap` maps a workflow step id to its prerequisite step ids.
   */
  readySteps(dependencyMap: Map<string, string[]>): RequestStepInstance[] {
    const satisfied = new Set(
      this.props.stepInstances
        .filter((si) => si.isDone() || si.status === StepInstanceStatus.SKIPPED)
        .map((si) => si.workflowStepId.toString()),
    )
    return this.props.stepInstances.filter((si) => {
      if (si.status !== StepInstanceStatus.PENDING) return false
      const deps = dependencyMap.get(si.workflowStepId.toString()) ?? []
      return deps.every((d) => satisfied.has(d))
    })
  }

  /** Complete the request once every step has reached a terminal state. */
  complete(): void {
    if (this.props.stepInstances.length === 0)
      throw new InvariantViolationError("Cannot complete a request that has not started a workflow.")
    if (!this.props.stepInstances.every((si) => si.isTerminal()))
      throw new InvariantViolationError("Cannot complete a request with unfinished steps.")
    this.transitionTo(RequestStatus.COMPLETED)
    this.props.completedAt = new Date()
  }

  reject(): void {
    this.transitionTo(RequestStatus.REJECTED)
    this.props.completedAt = new Date()
  }
  hold(): void { this.transitionTo(RequestStatus.ON_HOLD) }
  resume(): void { this.transitionTo(RequestStatus.IN_PROGRESS) }
  cancel(): void {
    this.transitionTo(RequestStatus.CANCELLED)
    this.props.completedAt = new Date()
  }

  private transitionTo(next: RequestStatus): void {
    if (!TRANSITIONS[this.props.currentStatus].includes(next))
      throw new InvariantViolationError(`Illegal transition ${this.props.currentStatus} -> ${next}.`)
    this.props.currentStatus = next
  }

  get status(): RequestStatus { return this.props.currentStatus }
  get classificationStatus(): ClassificationStatus { return this.props.classificationStatus }
  get templateId(): Identifier | undefined { return this.props.templateId }
  get requesterId(): Identifier { return this.props.requesterId }
  get stepInstances(): readonly RequestStepInstance[] { return this.props.stepInstances }
}
