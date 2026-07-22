import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { InvariantViolationError } from "../shared/domain-error"
import { StepInstanceStatus } from "./enums"

interface StepInstanceProps {
  requestId: Identifier
  workflowStepId: Identifier
  assignedToUserId?: Identifier
  status: StepInstanceStatus
  slaDueAt?: Date
  slaPaused: boolean
  startedAt?: Date
  completedAt?: Date
}

export interface StepInstanceSnapshot {
  id: string
  requestId: string
  workflowStepId: string
  assignedToUserId?: string
  status: StepInstanceStatus
  slaDueAt?: Date
  slaPaused: boolean
  startedAt?: Date
  completedAt?: Date
}

const TERMINAL: StepInstanceStatus[] = [
  StepInstanceStatus.DONE,
  StepInstanceStatus.SKIPPED,
  StepInstanceStatus.REJECTED,
]

/**
 * A runtime instance of a workflow step for one request. Enforces a small state
 * machine: PENDING -> IN_PROGRESS -> DONE/REJECTED/SKIPPED, with WAITING used
 * while the step's SLA is paused or it is blocked.
 */
export class RequestStepInstance extends Entity {
  private constructor(id: Identifier, private props: StepInstanceProps) {
    super(id)
  }

  static create(
    id: Identifier,
    p: { requestId: Identifier; workflowStepId: Identifier; slaDueAt?: Date },
  ): RequestStepInstance {
    return new RequestStepInstance(id, {
      requestId: p.requestId,
      workflowStepId: p.workflowStepId,
      status: StepInstanceStatus.PENDING,
      slaDueAt: p.slaDueAt,
      slaPaused: false,
    })
  }

  static rehydrate(id: Identifier, props: StepInstanceProps): RequestStepInstance {
    return new RequestStepInstance(id, props)
  }

  private assertNotTerminal(): void {
    if (TERMINAL.includes(this.props.status))
      throw new InvariantViolationError(`Step is already ${this.props.status} and cannot change.`)
  }

  assignTo(userId: Identifier): void {
    this.assertNotTerminal()
    this.props.assignedToUserId = userId
  }

  start(): void {
    this.assertNotTerminal()
    if (!this.props.assignedToUserId)
      throw new InvariantViolationError("Cannot start an unassigned step.")
    this.props.status = StepInstanceStatus.IN_PROGRESS
    this.props.startedAt = this.props.startedAt ?? new Date()
  }

  complete(): void {
    this.assertNotTerminal()
    this.props.status = StepInstanceStatus.DONE
    this.props.completedAt = new Date()
  }

  reject(): void {
    this.assertNotTerminal()
    this.props.status = StepInstanceStatus.REJECTED
    this.props.completedAt = new Date()
  }

  skip(): void {
    this.assertNotTerminal()
    this.props.status = StepInstanceStatus.SKIPPED
    this.props.completedAt = new Date()
  }

  pauseSla(): void {
    this.props.slaPaused = true
    this.props.status = StepInstanceStatus.WAITING
  }

  resumeSla(): void {
    this.props.slaPaused = false
    this.props.status = StepInstanceStatus.IN_PROGRESS
  }

  get status(): StepInstanceStatus { return this.props.status }
  get workflowStepId(): Identifier { return this.props.workflowStepId }
  get assignedToUserId(): Identifier | undefined { return this.props.assignedToUserId }
  isTerminal(): boolean { return TERMINAL.includes(this.props.status) }
  isDone(): boolean { return this.props.status === StepInstanceStatus.DONE }

  snapshot(): StepInstanceSnapshot {
    return {
      id: this.id.toString(),
      requestId: this.props.requestId.toString(),
      workflowStepId: this.props.workflowStepId.toString(),
      assignedToUserId: this.props.assignedToUserId?.toString(),
      status: this.props.status,
      slaDueAt: this.props.slaDueAt,
      slaPaused: this.props.slaPaused,
      startedAt: this.props.startedAt,
      completedAt: this.props.completedAt,
    }
  }
}
