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
  slaDueAt?: Date
  completedAt?: Date
  confirmedAt?: Date
  extractionAttemptedAt?: Date
  /** Set by the database on insert; the aggregate only ever reads it. */
  createdAt?: Date
  businessDurationMinutes?: number
  version: number
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
  slaDueAt?: Date
  completedAt?: Date
  confirmedAt?: Date
  extractionAttemptedAt?: Date
  businessDurationMinutes?: number
  version: number
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
      version: 0,
      stepInstances: [],
    })
  }

  static rehydrate(id: Identifier, props: RequestProps): Request {
    return new Request(id, props)
  }

  // ----- classification -----

  /**
 * Apply an automatic (NLP) classification.
 *
 * The model chooses a template and nothing else. Business priority arrives
 * with the template instead: `templateDefaultPriority` is what an
 * administrator declared once for every request of that kind, so urgency is a
 * property of the paperwork rather than a reading of how somebody worded it.
 * That closes three holes at once -- a requester cannot talk their own request
 * up the queue, the model is not asked to judge importance from wording it was
 * never trained to judge, and the extractor has one less field to get wrong.
 *
 * Applied whether or not confidence cleared the threshold, because it is not
 * the model's opinion: it belongs to the template, and if a reviewer later
 * chooses a different template the priority follows that one instead.
 *
 * Priority is never changed automatically afterwards. The SLA monitor only
 * ever touches slaRisk, and staff holding `request.act` can raise or lower it
 * through changePriority(...) with a recorded reason.
 */
classifyByModel(
  templateId: Identifier,
  confidence: number,
  threshold = 0.8,
  templateDefaultPriority?: Priority,
): void {
  if (this.props.currentStatus !== RequestStatus.DRAFT)
    throw new InvariantViolationError("Only draft requests can be classified.")
  this.props.templateId = templateId
  this.props.classificationConfidence = confidence
  this.props.classifiedBy = ClassifiedBy.NLP
  const trusted = confidence >= threshold
  this.props.classificationStatus =
    trusted ? ClassificationStatus.CLASSIFIED : ClassificationStatus.HITL
  if (templateDefaultPriority) this.props.priority = templateDefaultPriority
}

  /**
 * A human resolves the classification (the HITL path).
 *
 * The reviewer chooses the template; priority follows from that template
 * exactly as it does on the automatic path, so the two routes cannot disagree
 * about what a request of this kind is worth. A reviewer who thinks this
 * particular request deserves different treatment says so through
 * changePriority(...), which records who decided and why.
 */
classifyByHuman(templateId: Identifier, templateDefaultPriority?: Priority): void {
  if (this.props.currentStatus !== RequestStatus.DRAFT)
    throw new InvariantViolationError("Only draft requests can be classified.")
  if (this.props.classificationStatus === ClassificationStatus.CLASSIFIED)
    throw new InvariantViolationError("This request is already classified; a reviewer cannot reclassify it.")
  this.props.templateId = templateId
  this.props.classifiedBy = ClassifiedBy.HITL
  this.props.classificationStatus = ClassificationStatus.CLASSIFIED
  if (templateDefaultPriority) this.props.priority = templateDefaultPriority
}

  setFilledData(data: Record<string, unknown>): void {
    if (this.props.currentStatus !== RequestStatus.DRAFT)
      throw new InvariantViolationError("Form data can only change while the request is a draft.")
    this.props.filledData = data
  }

  /**
   * Merge extracted values into the form data, rather than replacing it.
   *
   * The extractor answers the questions it can and abstains on the rest, so a
   * body only ever carries part of the form. A replacement would erase every
   * field the caller stayed silent about. Merging in the caller instead --
   * read, combine, write back -- has the same effect one race apart: two
   * writers each read the same form, and the slower one puts back a version
   * that never saw the other's fields. So the merge happens here, inside the
   * aggregate whose version the optimistic lock checks.
   *
   * Only a CLASSIFIED request accepts extraction. A HITL row is waiting for a
   * human to decide what it even is; a model writing fields into it would be
   * overwriting the judgement it was escalated for.
   *
   * This is the extractor's door, and only the extractor's. A reviewer
   * resolving a HITL request chooses the template and fills the form in the
   * same visit, through setFilledData: text ambiguous enough to defeat the
   * classifier is text the extractor is likely to fail on too, so sending it
   * back to a machine after a human has already read it buys a wrong form, a
   * dispute, and a second trip through this queue.
   */
  applyExtractedFields(patch: Record<string, unknown>): void {
    if (this.props.currentStatus !== RequestStatus.DRAFT)
      throw new InvariantViolationError("Form data can only change while the request is a draft.")
    if (this.props.classificationStatus !== ClassificationStatus.CLASSIFIED)
      throw new InvariantViolationError("Only a classified request accepts extracted field values.")
    this.props.filledData = { ...this.props.filledData, ...patch }
  }

  /** Drop every extracted value, so a reviewer starts from the raw text. */
  clearFilledData(): void {
    this.props.filledData = {}
  }

  /**
   * Record that the extractor has now had its turn at this request.
   *
   * Set whether or not anything was found. "Nobody has tried yet" and "a model
   * read the text and honestly found nothing" leave identical form data, and
   * the AI service used to distinguish them by asking for empty form data --
   * which meant it collected the second kind again on every single poll. The
   * stamp is what ends that, and it is deliberately not a status: the request
   * is still waiting for its requester either way.
   */
  markExtractionAttempted(): void {
    this.props.extractionAttemptedAt = new Date()
  }

  get extractionAttemptedAt(): Date | undefined { return this.props.extractionAttemptedAt }

  /**
   * The requester's own corrections, supplied at the moment they confirm.
   *
   * The same merge as an extraction run and under the same invariants, but
   * deliberately a separate name. A value a person typed and a value a model
   * guessed are not the same evidence, and a reader of this class should be
   * able to see that both roads lead here.
   */
  applyRequesterValues(patch: Record<string, unknown>): void {
    this.applyExtractedFields(patch)
  }

  // ----- the requester's confirmation -----

  /**
   * The requester accepts what was proposed: this template, these values.
   *
   * Two machine judgements stand between the sentence somebody typed and the
   * form a department will act on -- which template it is, and what each field
   * says. Both are usually right and neither is certain, and the person best
   * placed to catch a wrong one is the person who wrote the sentence. So the
   * confirmation is a stored fact rather than a screen the frontend shows: an
   * unconfirmed request cannot start a workflow, no matter which client calls.
   */
  confirm(): void {
    if (this.props.currentStatus !== RequestStatus.DRAFT)
      throw new InvariantViolationError("Only a draft request can be confirmed.")
    if (this.props.classificationStatus !== ClassificationStatus.CLASSIFIED)
      throw new InvariantViolationError("There is nothing to confirm until the request has been classified.")
    this.props.confirmedAt = new Date()
  }

  /**
   * The requester rejects what was proposed, and the request goes to a human.
   *
   * This introduces no new classification concept: a rejection is simply
   * another way into the review queue that low confidence already fills, and a
   * reviewer handles both through the same route. The extracted values are
   * dropped rather than left as a starting point -- if the template was wrong
   * they belong to the wrong form, and a half-corrected form is harder to spot
   * than an empty one.
   */
  dispute(): void {
    if (this.props.currentStatus !== RequestStatus.DRAFT)
      throw new InvariantViolationError("Only a draft request can be disputed.")
    this.props.classificationStatus = ClassificationStatus.HITL
    this.props.confirmedAt = undefined
    this.clearFilledData()
  }

  /**
   * Raise or lower business priority after classification.
   *
   * Deliberately out of a requester's reach: the caller is a member of staff
   * holding `request.act`, and it records the change as a request action
   * carrying a reason. "A doctor's note" or "the registration deadline is
   * Thursday" is a judgement only a person can make, and an unexplained jump
   * up a shared queue is exactly what an auditor asks about.
   */
  changePriority(priority: Priority): void { this.props.priority = priority }

  // ----- SLA urgency (separate axis from business priority) -----

  /** Raised by the SLA monitor when a request is close to breaching its SLA. */
  markAtRisk(): void { this.props.slaRisk = SlaRisk.AT_RISK }
  /** The request has passed its SLA due time. */
  markBreached(): void { this.props.slaRisk = SlaRisk.BREACHED }
  /** Clear the urgency flag (e.g. once the workload eases or the step completes). */
  clearSlaRisk(): void { this.props.slaRisk = SlaRisk.ON_TRACK }

  // ----- routing & execution -----

  /**
   * Attach a workflow path and its runtime step instances, then move to
   * IN_PROGRESS.
   *
   * Four things must already be true, and all four are checked here rather than
   * trusted to the caller: the request is classified, it carries a template,
   * its requester has confirmed that template and the extracted values, and the
   * path has at least one step. The confirmation in particular is part of the
   * invariant rather than a screen the frontend remembers to show -- being
   * classified only means the system knows what the request is, not that the
   * person who wrote it agrees.
   *
   * The steps are checked to belong to this request as well. They arrive built
   * by the caller, and a caller that built them from another aggregate would
   * otherwise have them written under this request's lock while their own
   * request_id pointed elsewhere: two parents for one row, and an aggregate
   * whose in-memory contents are not what the table says.
   */
  startWorkflow(workflowPathId: Identifier, stepInstances: RequestStepInstance[]): void {
    if (this.props.classificationStatus !== ClassificationStatus.CLASSIFIED)
      throw new InvariantViolationError("Cannot start a workflow before the request is classified.")
    if (!this.props.templateId)
      throw new InvariantViolationError("Cannot start a workflow without a template.")
    if (!this.props.confirmedAt)
      throw new InvariantViolationError("Cannot start a workflow before the requester confirms the template and the extracted values.")
    if (stepInstances.length === 0)
      throw new InvariantViolationError("A workflow must have at least one step.")
    const foreign = stepInstances.find(
      (si) => si.snapshot().requestId !== this.id.toString(),
    )
    if (foreign)
      throw new InvariantViolationError(
        `Step instance "${foreign.id.toString()}" belongs to another request and cannot be attached here.`,
      )
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

  /**
   * Store how long the request took, in working minutes.
   *
   * Takes the number rather than computing it: the measurement needs the
   * working-hours policy and the holiday calendar, both of which live in the
   * database, and an aggregate that reaches for the database to answer a
   * question about itself stops being testable in isolation. The caller that
   * already owns that service passes the answer in.
   */
  recordBusinessDuration(minutes: number): void {
    if (this.props.currentStatus !== RequestStatus.COMPLETED)
      throw new InvariantViolationError("Only a completed request has a duration to record.")
    this.props.businessDurationMinutes = Math.max(0, Math.round(minutes))
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
  get filledData(): Record<string, unknown> | undefined { return this.props.filledData }
  /**
   * How many times this request has been written. The repository refuses a save
   * whose version no longer matches the database, which is how two people
   * acting on the same request at the same moment stop overwriting each other.
   */
  get version(): number { return this.props.version }
  get priority(): Priority { return this.props.priority }
  get slaRisk(): SlaRisk { return this.props.slaRisk }
  get slaDueAt(): Date | undefined { return this.props.slaDueAt }
  /**
   * When the requester accepted the template and field values proposed for
   * them. Absent means nobody has looked yet, which is why `startWorkflow`
   * refuses to run.
   */
  get confirmedAt(): Date | undefined { return this.props.confirmedAt }
  get completedAt(): Date | undefined { return this.props.completedAt }
  get createdAt(): Date | undefined { return this.props.createdAt }
  get businessDurationMinutes(): number | undefined {
    return this.props.businessDurationMinutes
  }
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
      slaDueAt: this.props.slaDueAt,
      completedAt: this.props.completedAt,
      confirmedAt: this.props.confirmedAt,
      extractionAttemptedAt: this.props.extractionAttemptedAt,
      businessDurationMinutes: this.props.businessDurationMinutes,
      version: this.props.version,
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
