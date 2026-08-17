import { KeysetPage } from '../../shared/pagination';
import { DurationEstimateView, RequestSummaryView } from '../queries/views/request.view';
export interface ListRequestsByRequesterInput {
    requesterId: string;
    limit?: number;
    cursor?: string;
}
export interface ListRequestsAssignedInput {
    userId: string;
    limit?: number;
    cursor?: string;
    readyOnly?: boolean;
}
export interface ListRequestQueueInput {
    status: string;
    limit?: number;
    cursor?: string;
    classificationStatus?: string | string[];
    hasFilledData?: boolean;
    extracted?: boolean;
}
export declare const MIN_DURATION_SAMPLE_SIZE = 5;
export interface RequestQueryPort {
    listByRequester(input: ListRequestsByRequesterInput): Promise<KeysetPage<RequestSummaryView>>;
    listAssignedTo(input: ListRequestsAssignedInput): Promise<KeysetPage<RequestSummaryView>>;
    listQueue(input: ListRequestQueueInput): Promise<KeysetPage<RequestSummaryView>>;
    estimateDuration(templateId: string): Promise<DurationEstimateView | undefined>;
    resolveUserDisplayNames?(userIds: string[]): Promise<Record<string, string>>;
}
