import { ValueObject } from "../../shared/value-object"
import { InvariantViolationError } from "../../shared/domain-error"

/** How the human-readable request reference number resets its counter. */
export type SequenceResetPolicy = "YEARLY" | "MONTHLY" | "NEVER"

/**
 * Raw, institution-supplied numbering configuration (e.g. stored as a system
 * setting). Every field is optional; sensible defaults are applied so the
 * system always produces a valid reference number out of the box.
 */
export interface NumberingSchemeConfig {
  pattern?: string
  prefix?: string
  seqPadding?: number
  resetPolicy?: SequenceResetPolicy
  yearDigits?: number
}

type NumberingSchemeProps = {
  pattern: string
  prefix: string
  seqPadding: number
  resetPolicy: SequenceResetPolicy
  yearDigits: number
}

const DEFAULTS: NumberingSchemeProps = {
  pattern: "{prefix}-{year}-{seq}",
  prefix: "REQ",
  seqPadding: 5,
  resetPolicy: "YEARLY",
  yearDigits: 4,
}

const RESET_POLICIES: SequenceResetPolicy[] = ["YEARLY", "MONTHLY", "NEVER"]

/**
 * A customizable reference-numbering scheme. This is pure policy: given a
 * sequence value and a date it renders a reference string such as
 * "REQ-2026-00042", and it decides which counter (scope) a date draws from so
 * counters can restart yearly or monthly. All I/O -- loading the config and
 * atomically allocating the next sequence value -- lives behind the
 * ReferenceNumberGenerator port in the infrastructure layer.
 *
 * Supported pattern tokens: {prefix} {year} {month} {seq}.
 */
export class NumberingScheme extends ValueObject<NumberingSchemeProps> {
  private constructor(props: NumberingSchemeProps) {
    super(props)
  }

  static create(config: NumberingSchemeConfig = {}): NumberingScheme {
    const props: NumberingSchemeProps = {
      pattern: config.pattern?.trim() || DEFAULTS.pattern,
      prefix: config.prefix ?? DEFAULTS.prefix,
      seqPadding: config.seqPadding ?? DEFAULTS.seqPadding,
      resetPolicy: config.resetPolicy ?? DEFAULTS.resetPolicy,
      yearDigits: config.yearDigits ?? DEFAULTS.yearDigits,
    }
    if (!props.pattern.includes("{seq}"))
      throw new InvariantViolationError('Numbering pattern must contain the "{seq}" token.')
    if (!Number.isInteger(props.seqPadding) || props.seqPadding < 0 || props.seqPadding > 12)
      throw new InvariantViolationError("Sequence padding must be an integer between 0 and 12.")
    if (props.yearDigits !== 2 && props.yearDigits !== 4)
      throw new InvariantViolationError("Year digits must be 2 or 4.")
    if (!RESET_POLICIES.includes(props.resetPolicy))
      throw new InvariantViolationError(`Unknown reset policy "${props.resetPolicy}".`)
    return new NumberingScheme(props)
  }

  /**
   * The counter a date draws from. NEVER shares one global counter; YEARLY and
   * MONTHLY use a per-period counter so numbers restart each year / month.
   */
  scopeFor(date: Date): string {
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth() + 1
    switch (this.props.resetPolicy) {
      case "NEVER":
        return "GLOBAL"
      case "MONTHLY":
        return `${year}-${this.pad(month, 2)}`
      case "YEARLY":
      default:
        return String(year)
    }
  }

  /** Render the reference string for a sequence value on a given date. */
  format(sequence: number, date: Date): string {
    const year = date.getUTCFullYear()
    const yearToken =
      this.props.yearDigits === 2 ? this.pad(year % 100, 2) : String(year)
    return this.props.pattern
      .replace(/\{prefix\}/g, this.props.prefix)
      .replace(/\{year\}/g, yearToken)
      .replace(/\{month\}/g, this.pad(date.getUTCMonth() + 1, 2))
      .replace(/\{seq\}/g, this.pad(sequence, this.props.seqPadding))
  }

  private pad(value: number, width: number): string {
    return String(value).padStart(width, "0")
  }

  get pattern(): string {
    return this.props.pattern
  }

  get resetPolicy(): SequenceResetPolicy {
    return this.props.resetPolicy
  }
}
