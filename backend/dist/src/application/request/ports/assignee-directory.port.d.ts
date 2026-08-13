export interface FindCandidatesQuery {
    roleId?: string;
    departmentId?: string;
    requireScoped?: boolean;
    preferDepartmentId?: string;
    excludeUserId?: string;
}
export interface AssigneeCandidate {
    userId: string;
    openStepCount: number;
    scoped?: boolean;
}
export interface AssigneeDirectoryPort {
    findCandidates(query: FindCandidatesQuery): Promise<AssigneeCandidate[]>;
    getUserDepartmentId(userId: string): Promise<string | null>;
    findFacultyId(departmentId: string): Promise<string | null>;
    getParentDepartmentId(departmentId: string): Promise<string | null>;
    findActiveDelegations(on: Date): Promise<Map<string, string>>;
    isAssignable(userId: string): Promise<boolean>;
    findRoleHolders(query: {
        roleId: string;
        excludeUserId?: string;
    }): Promise<AssigneeCandidate[]>;
}
