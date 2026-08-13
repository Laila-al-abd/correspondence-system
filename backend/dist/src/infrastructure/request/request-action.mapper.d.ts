import { Prisma, RequestAction as RequestActionRow } from '../../../generated/prisma/client';
import { RequestAction } from '../../domain/request/request-action';
export declare const RequestActionMapper: {
    toDomain(row: RequestActionRow): RequestAction;
    toPersistence(action: RequestAction): Prisma.RequestActionUncheckedCreateInput;
};
