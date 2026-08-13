import { ApplicantPurpose } from '../../../domain/identity/enums';
export declare class RegisterUserDto {
    fullNameAr: string;
    fullNameEn?: string;
    email: string;
    phone?: string;
    password: string;
    applicantPurpose?: ApplicantPurpose;
    preferredLang?: string;
}
