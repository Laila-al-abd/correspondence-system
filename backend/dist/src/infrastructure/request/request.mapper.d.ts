import { Prisma } from '../../../generated/prisma/client';
import { Request } from '../../domain/request/request';
import type { StepInstanceSnapshot } from '../../domain/request/request-step-instance';
export declare const requestInclude: {
    stepInstances: true;
};
type RequestWithChildren = Prisma.RequestGetPayload<{
    include: typeof requestInclude;
}>;
export declare const RequestMapper: {
    toDomain(row: RequestWithChildren): Request;
    toRoot(request: Request): Prisma.RequestUncheckedCreateInput;
    toStepInstanceRow(si: StepInstanceSnapshot): Prisma.RequestStepInstanceUncheckedCreateInput;
};
export {};
