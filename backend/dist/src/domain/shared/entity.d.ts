import { Identifier } from "./identifier";
export interface DomainEvent {
    readonly name: string;
    readonly occurredAt: Date;
}
export declare abstract class Entity {
    readonly id: Identifier;
    protected constructor(id: Identifier);
    equals(other?: Entity): boolean;
}
export declare abstract class AggregateRoot extends Entity {
    private _events;
    protected raise(event: DomainEvent): void;
    pullEvents(): DomainEvent[];
}
