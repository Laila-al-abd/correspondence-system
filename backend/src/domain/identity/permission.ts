// domain/identity/permission.ts
import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"

interface PermissionProps {
  code: string
  name: LocalizedText
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
}
