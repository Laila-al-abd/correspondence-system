import type { ListDelegationsFilter } from '../../ports/delegation-query.port'

export class ListDelegationsQuery {
  constructor(public readonly filter: ListDelegationsFilter) {}
}
