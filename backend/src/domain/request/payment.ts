import { AggregateRoot } from "../shared/entity"
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
  confirmedBy?: Identifier
  requestedAt?: Date
  confirmedAt?: Date
}

/**
 * A fee tied to a request. Lifecycle: REQUIRED -> CONFIRMED (paid) or WAIVED.
 * Confirmation and waiver are one-way transitions recorded with who and when.
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

  confirm(by: Identifier): void {
    this.assertPending()
    this.props.status = PaymentStatus.CONFIRMED
    this.props.confirmedBy = by
    this.props.confirmedAt = new Date()
  }

  waive(by: Identifier): void {
    this.assertPending()
    this.props.status = PaymentStatus.WAIVED
    this.props.confirmedBy = by
    this.props.confirmedAt = new Date()
  }

  get status(): PaymentStatus { return this.props.status }
  get money(): Money { return this.props.money }
  isSettled(): boolean { return this.props.status !== PaymentStatus.REQUIRED }
}
