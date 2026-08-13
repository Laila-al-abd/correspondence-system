import type { ListDelegationsFilter } from '../../ports/delegation-query.port';
export declare class ListDelegationsQuery {
    readonly filter: ListDelegationsFilter;
    constructor(filter: ListDelegationsFilter);
}
