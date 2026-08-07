import { AggregateRoot } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"
import { InvariantViolationError } from "../shared/domain-error"

interface RoleProps {
  name: LocalizedText
  description?: LocalizedText
  isSystem: boolean
  permissionCodes: Set<string>
  deletedAt?: Date
}

export class Role extends AggregateRoot {
  private constructor(id: Identifier, private props: RoleProps) {
    super(id)
  }

  static create(
    id: Identifier,
    name: LocalizedText,
    description?: LocalizedText,
  ): Role {
    return new Role(id, {
      name,
      description,
      isSystem: false,
      permissionCodes: new Set(),
    })
  }

  static rehydrate(id: Identifier, props: RoleProps): Role {
    return new Role(id, props)
  }

  /**
   * The line between seeded roles and administered ones.
   *
   * `is_system` marks the roles the seed owns: Administrator and the accounts
   * the software itself needs. They are reference data, not configuration --
   * the seed asserts their contents on every run, so an edit made through the
   * API would be silently reverted the next time anyone deploys. Refusing the
   * edit is more honest than accepting one that will not survive.
   *
   * It also removes the shortest route to locking everyone out: the
   * Administrator role is the only holder of `user.manage` in a fresh
   * installation, and stripping a permission from a role takes it from every
   * holder at once. A super admin who needs different authority composes a new
   * role rather than reaching into a built-in one.
   *
   * Every mutator goes through this guard, including grant(). An earlier version
   * guarded only revoke(), on the grounds that nothing reached grant() -- true
   * at the time, and exactly the sort of asymmetry that outlives its reason.
   */
  private assertMutable(): void {
    if (this.props.isSystem)
      throw new InvariantViolationError(
        "Built-in roles are defined by the system and cannot be modified.",
      )
  }

  /**
   * Renames the role. A role must always have a name, so `name` is required
   * even when only the description is changing; an omitted `description` clears
   * it, which is the only way to remove one.
   */
  rename(name: LocalizedText, description?: LocalizedText): void {
    this.assertMutable()
    this.props.name = name
    this.props.description = description
  }

  grant(code: string): void {
    this.assertMutable()
    this.props.permissionCodes.add(code)
  }

  revoke(code: string): void {
    this.assertMutable()
    this.props.permissionCodes.delete(code)
  }

  /**
   * Retires the role. Soft, because `user_roles` rows record who held what and
   * when, and a hard delete would either cascade that history away or fail
   * against the foreign key. Idempotent: retiring a retired role changes
   * nothing rather than rewriting the date it happened.
   */
  softDelete(at: Date = new Date()): void {
    this.assertMutable()
    if (this.props.deletedAt) return
    this.props.deletedAt = at
  }

  has(code: string): boolean { return this.props.permissionCodes.has(code) }
  get permissions(): string[] { return [...this.props.permissionCodes] }
  get name(): LocalizedText { return this.props.name }
  get description(): LocalizedText | undefined { return this.props.description }
  get isSystem(): boolean { return this.props.isSystem }
  get deletedAt(): Date | undefined { return this.props.deletedAt }
  get isRetired(): boolean { return this.props.deletedAt !== undefined }
}
