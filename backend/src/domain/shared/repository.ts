import { AggregateRoot } from "./entity"
import { Identifier } from "./identifier"
// Base port. Concrete ports extend this in each context.
export interface Repository<T extends AggregateRoot> {
findById(id: Identifier): Promise<T | null>
save(aggregate: T): Promise<void>
}