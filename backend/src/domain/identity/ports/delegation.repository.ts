import { Repository } from "../../shared/repository"
import { Identifier } from "../../shared/identifier"
import { Delegation } from "../delegation"
export interface DelegationRepository extends Repository<Delegation> {
// Authority this user has handed out, active on the given date.
activeFor(delegatorId: Identifier, on: Date): Promise<Delegation | null>
// Authority handed *to* this user, active on the given date. The mirror image
// of activeFor, and what makes it possible to tell a delegator apart from a
// delegate without loading every delegation in the table.
activeToDelegate(delegateId: Identifier, on: Date): Promise<Delegation | null>
}