import { AggregateRoot } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { InvariantViolationError } from "../shared/domain-error"

interface DelegationProps {
  delegatorId: Identifier
  delegateId: Identifier
  start: Date
  end: Date
  isActive: boolean
  reason?: string
}

export class Delegation extends AggregateRoot {
  private constructor(id: Identifier, private props: DelegationProps) {
    super(id)
  }

  static create(
    id: Identifier,
    p: { delegatorId: Identifier; delegateId: Identifier; start: Date; end: Date; reason?: string },
  ): Delegation {
    if (p.delegatorId.equals(p.delegateId))
      throw new InvariantViolationError("Cannot delegate to yourself.")
    if (p.end < p.start)
      throw new InvariantViolationError("Delegation end date is before its start date.")
    return new Delegation(id, { ...p, isActive: true })
  }

  static rehydrate(id: Identifier, props: DelegationProps): Delegation {
    return new Delegation(id, props)
  }

  /** Is this delegation in force on a given day? */
  isEffectiveOn(day: Date): boolean {
    return this.props.isActive && day >= this.props.start && day <= this.props.end
  }

  revoke(): void { this.props.isActive = false }
  get delegateId(): Identifier { return this.props.delegateId }

  /** Flat, primitive view of the delegation for the persistence mapper. */
  snapshot(): {
    delegatorId: string
    delegateId: string
    start: Date
    end: Date
    isActive: boolean
    reason?: string
  } {
    return {
      delegatorId: this.props.delegatorId.toString(),
      delegateId: this.props.delegateId.toString(),
      start: this.props.start,
      end: this.props.end,
      isActive: this.props.isActive,
      reason: this.props.reason,
    }
  }
}
