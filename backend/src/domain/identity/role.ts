import { AggregateRoot } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"
import { InvariantViolationError } from "../shared/domain-error"

interface RoleProps {
  name: LocalizedText
  isSystem: boolean
  permissionCodes: Set<string>
}

export class Role extends AggregateRoot {
  private constructor(id: Identifier, private props: RoleProps) {
    super(id)
  }

  static create(id: Identifier, name: LocalizedText): Role {
    return new Role(id, { name, isSystem: false, permissionCodes: new Set() })
  }

  static rehydrate(id: Identifier, props: RoleProps): Role {
    return new Role(id, props)
  }

  /**
   * Role definitions are reference data owned by the seed, not by the API:
   * there is no controller that reaches grant() or revoke(), and roles change
   * a few times a year rather than daily. The isSystem guard below therefore
   * documents an intent more than it blocks a caller. It is left asymmetric on
   * purpose — adding a guard to grant() as well would be ceremony over an
   * unreachable path, and the day a role-management screen exists both halves
   * will need revisiting together anyway.
   */
  grant(code: string): void { this.props.permissionCodes.add(code) }

  revoke(code: string): void {
    if (this.props.isSystem)
      throw new InvariantViolationError("System roles cannot be modified.")
    this.props.permissionCodes.delete(code)
  }

  has(code: string): boolean { return this.props.permissionCodes.has(code) }
  get permissions(): string[] { return [...this.props.permissionCodes] }
  get name(): LocalizedText { return this.props.name }
  get isSystem(): boolean { return this.props.isSystem }
}
