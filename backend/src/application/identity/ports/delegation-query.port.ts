/**
 * Read-side port for delegations. The write model (the Delegation aggregate)
 * enforces invariants; this port returns flat, presentation-ready views that
 * resolve the delegator and delegate names for the admin delegation screens.
 * Soft-deleted rows are always excluded.
 */
import { OffsetPage } from '../../shared/pagination'

export interface LocalizedName {
  ar: string
  en?: string
}

export interface DelegationView {
  id: string
  delegatorId: string
  delegatorName: LocalizedName
  delegateId: string
  delegateName: LocalizedName
  // Inclusive calendar dates (YYYY-MM-DD).
  startDate: string
  endDate: string
  isActive: boolean
  reason: string | null
  createdAt: string
}

export interface ListDelegationsFilter {
  // Page size (clamped 1..200; default 50) and zero-based offset.
  limit?: number
  offset?: number
  delegatorId?: string
  delegateId?: string
  // When true, keep only currently-active (not revoked) delegations.
  activeOnly?: boolean
  // When set (YYYY-MM-DD), keep only delegations whose window covers this day.
  onDate?: string
}

export interface DelegationQueryPort {
  list(filter: ListDelegationsFilter): Promise<OffsetPage<DelegationView>>
  getById(id: string): Promise<DelegationView | null>
}
