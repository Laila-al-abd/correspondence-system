import { User } from '../../domain/identity/user';
import type { Prisma, User as UserRow } from '../../../generated/prisma/client';
export declare const UserMapper: {
    toDomain(row: UserRow): User;
    toPersistence(user: User): Prisma.UserUncheckedCreateInput;
};
