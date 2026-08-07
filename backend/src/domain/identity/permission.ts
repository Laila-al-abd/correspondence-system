// domain/identity/permission.ts
import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"

interface PermissionProps {
  code: string
  name: LocalizedText
  /**
   * What holding this permission actually lets somebody do, in Arabic and
   * English. The name is a label ("Act on requests"); this is the sentence an
   * administrator reads before granting it to a role, which is the moment the
   * difference between 'read' and 'act' has to be unambiguous.
   */
  description?: LocalizedText
  groupId?: Identifier
}

export class Permission extends Entity {
  private constructor(id: Identifier, private props: PermissionProps) {
    super(id)
  }

  static rehydrate(id: Identifier, props: PermissionProps): Permission {
    return new Permission(id, props)
  }

  get code(): string { return this.props.code } // e.g. 'request.create'
  get name(): LocalizedText { return this.props.name }
  get description(): LocalizedText | undefined { return this.props.description }
  get groupId(): Identifier | undefined { return this.props.groupId }
}
