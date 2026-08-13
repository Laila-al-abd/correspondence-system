declare class LocalizedTextDto {
    ar: string;
    en?: string;
}
export declare class CreateDepartmentDto {
    unitTypeCode: string;
    name: LocalizedTextDto;
    description?: LocalizedTextDto;
    parentId?: string;
}
export {};
