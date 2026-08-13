import type { ListUsersFilter, ListUsersResult, UserDetailView, UserQueryPort } from '../../application/identity/ports/user-query.port';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaUserQuery implements UserQueryPort {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filter: ListUsersFilter): Promise<ListUsersResult>;
    getDetail(id: string): Promise<UserDetailView | null>;
}
