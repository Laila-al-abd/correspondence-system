import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"
import { OrgUnitKind } from "./enums"
export class OrgUnitType extends Entity {
private constructor(id: Identifier, private props: { kind: 
OrgUnitKind; name: LocalizedText }) { super(id) }
static rehydrate(id: Identifier, props: { kind: OrgUnitKind; name: LocalizedText }) { return new OrgUnitType(id, props) 
}
get kind(): OrgUnitKind { return this.props.kind }
}