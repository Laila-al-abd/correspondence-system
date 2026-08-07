import { AggregateRoot } from "../shared/entity"
import { Guard } from "../shared/guard"
import { Identifier } from "../shared/identifier"
import { InvariantViolationError } from "../shared/domain-error"
import { Money } from "./value-objects/money"
import { PaymentStatus } from "./enums"

interface PaymentProps {
  requestId: Identifier
  requestStepInstanceId?: Identifier
  money: Money
  status: PaymentStatus
  requestedBy?: Identifier
  /**
   * Who ended this fee's life, and when -- by taking the money or by dropping
   * it. Named for what the two endings have in common rather than for one of
   * them: `confirmedBy` / `confirmedAt` were written on a waiver too, so the
   * names claimed a payment was confirmed when nobody had paid anything, and
   * only `status` told you which had actually happened.
   */
  settledBy?: Identifier
  requestedAt?: Date
  settledAt?: Date
  /** Why the fee was dropped. Required whenever the status is WAIVED. */
  waiverReason?: string
}

export interface PaymentSnapshot {
  requestId: string
  requestStepInstanceId?: string
  amount: number
  currency: string
  status: PaymentStatus
  requestedBy?: string
  settledBy?: string
  requestedAt?: Date
  settledAt?: Date
  waiverReason?: string
}

/**
 * A fee tied to a request. Lifecycle: REQUIRED -> CONFIRMED (paid) or WAIVED.
 *
 * Both endings are one-way and both record who and when. WAIVED is not a
 * cancellation: the fee is dropped and the request carries on exactly as if it
 * had been paid -- an exemption, a hardship case, an internal request, or a fee
 * charged in error. Because that is a decision to forgo money the institute was
 * owed, a waiver must also say why.
 */
export class Payment extends AggregateRoot {
  private constructor(id: Identifier, private props: PaymentProps) {
    super(id)
  }

  static request(
    id: Identifier,
    p: {
      requestId: Identifier
      money: Money
      requestStepInstanceId?: Identifier
      requestedBy?: Identifier
    },
  ): Payment {
    return new Payment(id, {
      requestId: p.requestId,
      requestStepInstanceId: p.requestStepInstanceId,
      money: p.money,
      status: PaymentStatus.REQUIRED,
      requestedBy: p.requestedBy,
      requestedAt: new Date(),
    })
  }

  static rehydrate(id: Identifier, props: PaymentProps): Payment {
    return new Payment(id, props)
  }

  private assertPending(): void {
    if (this.props.status !== PaymentStatus.REQUIRED)
      throw new InvariantViolationError(`Payment is already ${this.props.status}.`)
  }

  /** The money arrived. */
  confirm(by: Identifier): void {
    this.assertPending()
    this.props.status = PaymentStatus.CONFIRMED
    this.props.settledBy = by
    this.props.settledAt = new Date()
  }

  /**
   * The fee is dropped and the request proceeds. The reason is not optional: a
   * waiver is the one outcome nobody can reconstruct from the amount and the
   * dates, and it is the first thing an audit asks to see justified.
   */
  waive(by: Identifier, reason: string): void {
    this.assertPending()
    this.props.status = PaymentStatus.WAIVED
    this.props.settledBy = by
    this.props.settledAt = new Date()
    this.props.waiverReason = Guard.againstEmpty(reason, "waiverReason")
  }

  get status(): PaymentStatus { return this.props.status }
  get money(): Money { return this.props.money }
  get waiverReason(): string | undefined { return this.props.waiverReason }
  isSettled(): boolean { return this.props.status !== PaymentStatus.REQUIRED }

  snapshot(): PaymentSnapshot {
    return {
      requestId: this.props.requestId.toString(),
      requestStepInstanceId: this.props.requestStepInstanceId?.toString(),
      amount: this.props.money.amount,
      currency: this.props.money.currency,
      status: this.props.status,
      requestedBy: this.props.requestedBy?.toString(),
      settledBy: this.props.settledBy?.toString(),
      requestedAt: this.props.requestedAt,
      settledAt: this.props.settledAt,
      waiverReason: this.props.waiverReason,
    }
  }
}
