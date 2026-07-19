import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"
import { InvariantViolationError } from "../shared/domain-error"

interface SensitivityLevelProps {
  name: LocalizedText
  rank: number
  description?: LocalizedText
}

/**
 * A confidentiality tier (e.g. Public < Internal < Confidential < Secret).
 * `rank` gives a total ordering so the system can compare and escalate
 * sensitivity when routing requests.
 */
export class SensitivityLevel extends Entity {
  private constructor(id: Identifier, private props: SensitivityLevelProps) {
    super(id)
  }

  static create(id: Identifier, p: SensitivityLevelProps): SensitivityLevel {
    if (!Number.isInteger(p.rank) || p.rank < 0)
      throw new InvariantViolationError("Sensitivity rank must be a non-negative integer.")
    return new SensitivityLevel(id, p)
  }

  static rehydrate(id: Identifier, props: SensitivityLevelProps): SensitivityLevel {
    return new SensitivityLevel(id, props)
  }

  get rank(): number { return this.props.rank }
  get name(): LocalizedText { return this.props.name }

  /** True when this level is at least as strict as another. */
  isAtLeast(other: SensitivityLevel): boolean { return this.props.rank >= other.props.rank }
}
