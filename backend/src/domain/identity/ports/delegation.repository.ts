import { Repository } from "../../shared/repository"
import { Identifier } from "../../shared/identifier"
import { Delegation } from "../delegation"
export interface DelegationRepository extends Repository<Delegation> {
activeFor(delegatorId: Identifier, on: Date): Promise<Delegation | null>
}