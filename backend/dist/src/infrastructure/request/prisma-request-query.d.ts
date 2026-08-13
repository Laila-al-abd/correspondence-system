import type { ListRequestQueueInput, ListRequestsAssignedInput, ListRequestsByRequesterInput, RequestQueryPort } from '../../application/request/ports/request-query.port';
import { DurationEstimateView, RequestSummaryView } from '../../application/request/queries/views/request.view';
import { KeysetPage } from '../../application/shared/pagination';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaRequestQuery implements RequestQueryPort {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private get db();
    estimateDuration(templateId: string): Promise<DurationEstimateView | undefined>;
    listByRequester(input: ListRequestsByRequesterInput): Promise<KeysetPage<RequestSummaryView>>;
    listAssignedTo(input: ListRequestsAssignedInput): Promise<KeysetPage<RequestSummaryView>>;
    private listReadyForUser;
    private listNewestFirst;
    listQueue(input: ListRequestQueueInput): Promise<KeysetPage<RequestSummaryView>>;
}
