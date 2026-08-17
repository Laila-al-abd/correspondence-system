declare class LocalizedTextDto {
    ar: string;
    en?: string;
}
export declare class UpdateDepartmentDto {
    name?: LocalizedTextDto;
    description?: LocalizedTextDto | null;
}
export {};
