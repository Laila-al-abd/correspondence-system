import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"

interface RequestCategoryProps {
  name: LocalizedText
  description?: LocalizedText
}

/** A grouping of request templates (e.g. "Academic Affairs", "Financial"). */
export class RequestCategory extends Entity {
  private constructor(id: Identifier, private props: RequestCategoryProps) {
    super(id)
  }

  static create(id: Identifier, name: LocalizedText, description?: LocalizedText): RequestCategory {
    return new RequestCategory(id, { name, description })
  }

  static rehydrate(id: Identifier, props: RequestCategoryProps): RequestCategory {
    return new RequestCategory(id, props)
  }

  get name(): LocalizedText { return this.props.name }
}
