import { ValueObject } from "../../shared/value-object"
import { InvariantViolationError } from "../../shared/domain-error"

/** A non-negative monetary amount in a given ISO currency (defaults to SYP). */
export class Money extends ValueObject<{ amount: number; currency: string }> {
  private constructor(props: { amount: number; currency: string }) { super(props) }

  static create(amount: number, currency = "SYP"): Money {
    if (!(amount >= 0)) throw new InvariantViolationError("Amount must be non-negative.")
    return new Money({ amount, currency })
  }

  get amount(): number { return this.props.amount }
  get currency(): string { return this.props.currency }
}
