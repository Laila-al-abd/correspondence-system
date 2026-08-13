export interface LocalizedTextView {
    ar: string;
    en?: string;
}
export interface PermissionView {
    id: string;
    code: string;
    name: LocalizedTextView;
    description: LocalizedTextView | null;
}
export interface PermissionGroupView {
    id: string;
    name: LocalizedTextView;
    description: LocalizedTextView | null;
    permissions: PermissionView[];
}
export interface RoleSummaryView {
    id: string;
    name: LocalizedTextView;
    description: LocalizedTextView | null;
    isSystem: boolean;
    permissionCount: number;
    assignmentCount: number;
    createdAt: string;
}
export interface RoleDetailView extends RoleSummaryView {
    permissions: PermissionView[];
}
export interface RoleQueryPort {
    listRoles(): Promise<RoleSummaryView[]>;
    getRole(id: string): Promise<RoleDetailView | null>;
    listPermissionGroups(): Promise<PermissionGroupView[]>;
}
