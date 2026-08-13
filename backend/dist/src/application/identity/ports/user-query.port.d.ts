export interface UserSummaryView {
    id: string;
    userType: string;
    fullNameAr: string;
    fullNameEn: string | null;
    email: string;
    phone: string | null;
    institutionalNumber: string | null;
    departmentId: string | null;
    status: string;
    authProvider: string;
    preferredLang: string;
    createdAt: string;
}
export interface UserRoleView {
    roleId: string;
    roleName: {
        ar: string;
        en?: string;
    };
    departmentId: string | null;
    expiresAt: string | null;
    assignedAt: string;
}
export interface UserAttributeView {
    attributeId: string;
    attributeCode: string;
    value: unknown;
}
export interface UserDetailView extends UserSummaryView {
    applicantPurpose: string | null;
    roles: UserRoleView[];
    attributes: UserAttributeView[];
}
export interface ListUsersFilter {
    search?: string;
    userType?: string;
    status?: string;
    departmentId?: string;
    limit?: number;
    offset?: number;
}
export interface ListUsersResult {
    total: number;
    limit: number;
    offset: number;
    items: UserSummaryView[];
}
export interface UserQueryPort {
    list(filter: ListUsersFilter): Promise<ListUsersResult>;
    getDetail(id: string): Promise<UserDetailView | null>;
}
