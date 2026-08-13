import { IdGenerator } from '../../domain/shared/id-generator';
import { Identifier } from '../../domain/shared/identifier';
export declare class UuidV7IdGenerator implements IdGenerator {
    next(): Identifier;
}
