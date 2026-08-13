import { AggregateRoot } from "./entity";
import { Identifier } from "./identifier";
export interface Repository<T extends AggregateRoot> {
    findById(id: Identifier): Promise<T | null>;
    save(aggregate: T): Promise<void>;
}
