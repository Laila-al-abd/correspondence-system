import { OffsetPage } from '../../shared/pagination';
export interface LocalizedName {
    ar: string;
    en?: string;
}
export interface DelegationView {
    id: string;
    delegatorId: string;
    delegatorName: LocalizedName;
    delegateId: string;
    delegateName: LocalizedName;
    startDate: string;
    endDate: string;
    isActive: boolean;
    reason: string | null;
    createdAt: string;
}
export interface ListDelegationsFilter {
    limit?: number;
    offset?: number;
    delegatorId?: string;
    delegateId?: string;
    activeOnly?: boolean;
    onDate?: string;
}
export interface DelegationQueryPort {
    list(filter: ListDelegationsFilter): Promise<OffsetPage<DelegationView>>;
    getById(id: string): Promise<DelegationView | null>;
}
