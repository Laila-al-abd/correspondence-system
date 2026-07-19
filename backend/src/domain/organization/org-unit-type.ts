import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"
import { OrgUnitKind } from "./enums"

interface OrgUnitTypeProps {
  kind: OrgUnitKind
  name: LocalizedText
}

export class OrgUnitType extends Entity {
  private constructor(id: Identifier, private props: OrgUnitTypeProps) {
    super(id)
  }

  static rehydrate(id: Identifier, props: OrgUnitTypeProps): OrgUnitType {
    return new OrgUnitType(id, props)
  }

  get kind(): OrgUnitKind { return this.props.kind }
}
