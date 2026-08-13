export interface CreateUserInput {
    userType: string;
    fullNameAr: string;
    fullNameEn?: string;
    email: string;
    phone?: string;
    institutionalNumber: string;
    password: string;
    departmentId?: string;
    preferredLang?: string;
    roleId?: string;
    createdBy: string;
}
export declare class CreateUserCommand {
    readonly input: CreateUserInput;
    constructor(input: CreateUserInput);
}
