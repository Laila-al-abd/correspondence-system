import { AggregateRoot } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { InvariantViolationError } from "../shared/domain-error"
import { RequestStepInstance, StepInstanceSnapshot } from "./request-step-instance"
import {
  ClassificationStatus,
  ClassifiedBy,
  Priority,
  PRIORITY_RANK,
  RequestStatus,
  SlaRisk,
  SLA_RISK_RANK,
  StepInstanceStatus,
} from "./enums"

interface RequestProps {
  requesterId: Identifier
  referenceNo?: string
  rawText?: string
  templateId?: Identifier
  workflowPathId?: Identifier
  filledData: Record<string, unknown>
  classificationStatus: ClassificationStatus
  classificationConfidence?: number
  classifiedBy?: ClassifiedBy
  currentStatus: RequestStatus
  priority: Priority
  slaRisk: SlaRisk
  sensitivityLevelId?: Identifier
  slaDueAt?: Date
  completedAt?: Date
  stepInstances: RequestStepInstance[]
}

export interface RequestSnapshot {
  requesterId: string
  referenceNo?: string
  rawText?: string
  templateId?: string
  workflowPathId?: string
  filledData: Record<string, unknown>
  classificationStatus: ClassificationStatus
  classificationConfidence?: number
  classifiedBy?: ClassifiedBy
  currentStatus: RequestStatus
  priority: Priority
  slaRisk: SlaRisk
  sensitivityLevelId?: string
  slaDueAt?: Date
  completedAt?: Date
  stepInstances: StepInstanceSnapshot[]
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
    p: {
      requesterId: Identifier
      referenceNo?: string
      rawText?: string
      priority?: Priority
    },
  ): Request {
    return new Request(id, {
      requesterId: p.requesterId,
      referenceNo: p.referenceNo,
      rawText: p.rawText,
      filledData: {},
      classificationStatus: ClassificationStatus.PENDING,
      currentStatus: RequestStatus.DRAFT,
      priority: p.priority ?? Priority.NORMAL,
      slaRisk: SlaRisk.ON_TRACK,
      stepInstances: [],
    })
  }

  static rehydrate(id: Identifier, props: RequestProps): Request {
    return new Request(id, props)
  }

  // ----- classification -----

  /**
 * Apply an automatic (NLP) classification. The model may also propose an
 * initial priority, which we only trust when confidence clears the threshold.
 * Below the threshold the request goes to human-in-the-loop review, and the
 * human sets both the type and the priority via classifyByHuman(...).
 * This is a one-time suggestion: priority is never changed automatically
 * afterwards (the SLA monitor only ever touches slaRisk).
 */
classifyByModel(
  templateId: Identifier,
  confidence: number,
  threshold = 0.8,
  suggestedPriority?: Priority,
): void {
  if (this.props.currentStatus !== RequestStatus.DRAFT)
    throw new InvariantViolationError("Only draft requests can be classified.")
  this.props.templateId = templateId
  this.props.classificationConfidence = confidence
  this.props.classifiedBy = ClassifiedBy.NLP
  const trusted = confidence >= threshold
  this.props.classificationStatus =
    trusted ? ClassificationStatus.CLASSIFIED : ClassificationStatus.HITL
  if (trusted && suggestedPriority) this.props.priority = suggestedPriority
}

  /** A human resolves or overrides the classification (HITL), optionally setting priority. */
classifyByHuman(templateId: Identifier, priority?: Priority): void {
  this.props.templateId = templateId
  this.props.classifiedBy = ClassifiedBy.HITL
  this.props.classificationStatus = ClassificationStatus.CLASSIFIED
  if (priority) this.props.priority = priority
}

  setFilledData(data: Record<string, unknown>): void {
    if (this.props.currentStatus !== RequestStatus.DRAFT)
      throw new InvariantViolationError("Form data can only change while the request is a draft.")
    this.props.filledData = data
  }

  setSensitivity(levelId: Identifier): void { this.props.sensitivityLevelId = levelId }
  changePriority(priority: Priority): void { this.props.priority = priority }

  // ----- SLA urgency (separate axis from business priority) -----

  /** Raised by the LSTM monitor when a request is predicted to breach its SLA. */
  markAtRisk(): void { this.props.slaRisk = SlaRisk.AT_RISK }
  /** The request has passed its SLA due time. */
  markBreached(): void { this.props.slaRisk = SlaRisk.BREACHED }
  /** Clear the urgency flag (e.g. once the workload eases or the step completes). */
  clearSlaRisk(): void { this.props.slaRisk = SlaRisk.ON_TRACK }

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

  get referenceNo(): string | undefined { return this.props.referenceNo }
  get status(): RequestStatus { return this.props.currentStatus }
  get classificationStatus(): ClassificationStatus { return this.props.classificationStatus }
  get templateId(): Identifier | undefined { return this.props.templateId }
  get requesterId(): Identifier { return this.props.requesterId }
  get priority(): Priority { return this.props.priority }
  get slaRisk(): SlaRisk { return this.props.slaRisk }
  get slaDueAt(): Date | undefined { return this.props.slaDueAt }
  get stepInstances(): readonly RequestStepInstance[] { return this.props.stepInstances }

  snapshot(): RequestSnapshot {
    return {
      requesterId: this.props.requesterId.toString(),
      referenceNo: this.props.referenceNo,
      rawText: this.props.rawText,
      templateId: this.props.templateId?.toString(),
      workflowPathId: this.props.workflowPathId?.toString(),
      filledData: this.props.filledData,
      classificationStatus: this.props.classificationStatus,
      classificationConfidence: this.props.classificationConfidence,
      classifiedBy: this.props.classifiedBy,
      currentStatus: this.props.currentStatus,
      priority: this.props.priority,
      slaRisk: this.props.slaRisk,
      sensitivityLevelId: this.props.sensitivityLevelId?.toString(),
      slaDueAt: this.props.slaDueAt,
      completedAt: this.props.completedAt,
      stepInstances: this.props.stepInstances.map((si) => si.snapshot()),
    }
  }

  /**
   * Work-queue ordering across two axes: business importance first (a NORMAL
   * request never overtakes a genuine HIGH one), then SLA urgency, then the
   * nearest due date. Business priority is never mutated by the SLA monitor.
   */
  static compareForQueue(a: Request, b: Request): number {
    const byPriority = PRIORITY_RANK[b.props.priority] - PRIORITY_RANK[a.props.priority]
    if (byPriority !== 0) return byPriority
    const byRisk = SLA_RISK_RANK[b.props.slaRisk] - SLA_RISK_RANK[a.props.slaRisk]
    if (byRisk !== 0) return byRisk
    const aDue = a.props.slaDueAt?.getTime() ?? Number.POSITIVE_INFINITY
    const bDue = b.props.slaDueAt?.getTime() ?? Number.POSITIVE_INFINITY
    return aDue - bDue
  }
}
