import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"

interface UserAttributeProps {
  userId: Identifier
  attributeId: Identifier
  value: unknown
}

/**
 * A single ABAC attribute value held by a user (e.g. degree = "PhD"). The value
 * is stored as-is and fed to the eligibility engine keyed by attribute id.
 */
export class UserAttribute extends Entity {
  private constructor(id: Identifier, private props: UserAttributeProps) {
    super(id)
  }

  static create(id: Identifier, p: UserAttributeProps): UserAttribute {
    return new UserAttribute(id, p)
  }

  static rehydrate(id: Identifier, props: UserAttributeProps): UserAttribute {
    return new UserAttribute(id, props)
  }

  get userId(): Identifier { return this.props.userId }
  get attributeId(): Identifier { return this.props.attributeId }
  get value(): unknown { return this.props.value }

  snapshot(): {
    id: string
    userId: string
    attributeId: string
    value: unknown
  } {
    return {
      id: this.id.toString(),
      userId: this.props.userId.toString(),
      attributeId: this.props.attributeId.toString(),
      value: this.props.value,
    }
  }
}
