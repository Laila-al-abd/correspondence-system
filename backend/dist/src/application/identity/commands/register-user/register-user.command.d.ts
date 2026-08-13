export interface RegisterUserInput {
    fullNameAr: string;
    fullNameEn?: string;
    email: string;
    phone?: string;
    password: string;
    applicantPurpose?: string;
    preferredLang?: string;
}
export declare class RegisterUserCommand {
    readonly input: RegisterUserInput;
    constructor(input: RegisterUserInput);
}
