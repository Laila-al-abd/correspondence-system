import { Identifier } from "./identifier"
export interface DomainEvent { readonly name: string; readonly occurredAt: Date }
export abstract class Entity {
protected constructor(public readonly id: Identifier) {}
equals(other?: Entity): boolean { return !!other && this.id.equals(other.id) }
}
export abstract class AggregateRoot extends Entity {
private _events: DomainEvent[] = []
protected raise(event: DomainEvent): void { this._events.push(event) }
pullEvents(): DomainEvent[] { const e = this._events; this.
_events = []; return e }
}