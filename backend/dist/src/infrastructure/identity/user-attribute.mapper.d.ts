import type { UserAttribute as UserAttributeRow } from '../../../generated/prisma/client';
import { UserAttribute } from '../../domain/identity/user-attribute';
export declare const UserAttributeMapper: {
    toDomain(row: UserAttributeRow): UserAttribute;
};
