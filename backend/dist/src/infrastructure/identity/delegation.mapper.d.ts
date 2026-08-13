import { Delegation } from '../../domain/identity/delegation';
import type { Prisma, Delegation as DelegationRow } from '../../../generated/prisma/client';
export declare const DelegationMapper: {
    toDomain(row: DelegationRow): Delegation;
    toPersistence(delegation: Delegation): Prisma.DelegationUncheckedCreateInput;
};
