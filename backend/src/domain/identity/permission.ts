// domain/identity/permission.ts
import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"
export class Permission extends Entity {
private constructor(id: Identifier, private props: { code: 
string; name: LocalizedText; groupId?: Identifier }) { super
(id) }
static rehydrate(id: Identifier, props: { code: string; name: LocalizedText; groupId?: Identifier }) {
return new Permission(id, props)
}
get code(): string { return this.props.code }   // e.g. 'request.create'
}