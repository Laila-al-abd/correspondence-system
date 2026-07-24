import { AggregateRoot } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { Guard } from "../shared/guard"

interface SystemSettingProps {
  key: string
  value: unknown
  description?: string
  updatedBy?: Identifier
  updatedAt: Date
}

/**
 * A single configurable knob (e.g. classification threshold, request-number
 * format). The value is JSON so settings stay schema-flexible over time.
 */
export class SystemSetting extends AggregateRoot {
  private constructor(id: Identifier, private props: SystemSettingProps) {
    super(id)
  }

  static create(
    id: Identifier,
    p: { key: string; value: unknown; description?: string; updatedBy?: Identifier },
  ): SystemSetting {
    Guard.againstEmpty(p.key, "key")
    return new SystemSetting(id, { ...p, updatedAt: new Date() })
  }

  static rehydrate(id: Identifier, props: SystemSettingProps): SystemSetting {
    return new SystemSetting(id, props)
  }

  snapshot(): {
    key: string
    value: unknown
    description?: string
    updatedBy?: string
    updatedAt: Date
  } {
    return {
      key: this.props.key,
      value: this.props.value,
      description: this.props.description,
      updatedBy: this.props.updatedBy?.toString(),
      updatedAt: this.props.updatedAt,
    }
  }

  update(value: unknown, updatedBy?: Identifier): void {
    this.props.value = value
    this.props.updatedBy = updatedBy
    this.props.updatedAt = new Date()
  }

  get key(): string { return this.props.key }
  get value(): unknown { return this.props.value }
}
