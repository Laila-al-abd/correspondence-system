export declare class LocalizedTextDto {
    ar: string;
    en?: string;
}
export declare class CreateRoleDto {
    name: LocalizedTextDto;
    description?: LocalizedTextDto;
    permissionCodes?: string[];
}
