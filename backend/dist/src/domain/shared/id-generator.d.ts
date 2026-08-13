import { Identifier } from './identifier';
export interface IdGenerator {
    next(): Identifier;
}
