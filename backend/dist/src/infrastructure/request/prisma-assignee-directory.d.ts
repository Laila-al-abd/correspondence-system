import type { AssigneeCandidate, AssigneeDirectoryPort, FindCandidatesQuery } from '../../application/request/ports/assignee-directory.port';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaAssigneeDirectory implements AssigneeDirectoryPort {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findCandidates(query: FindCandidatesQuery): Promise<AssigneeCandidate[]>;
    findActiveDelegations(on: Date): Promise<Map<string, string>>;
    findRoleHolders(query: {
        roleId: string;
        excludeUserId?: string;
    }): Promise<AssigneeCandidate[]>;
    isAssignable(userId: string): Promise<boolean>;
    getUserDepartmentId(userId: string): Promise<string | null>;
    findFacultyId(departmentId: string): Promise<string | null>;
    getParentDepartmentId(departmentId: string): Promise<string | null>;
}
