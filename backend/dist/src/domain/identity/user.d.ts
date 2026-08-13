import { AggregateRoot } from "../shared/entity";
import { Identifier } from "../shared/identifier";
import { Email } from "./value-objects/email";
import { InstitutionalNumber } from "./value-objects/institutional-number";
import { PersonName } from "./value-objects/person-name";
import { AuthMethod, ApplicantPurpose, UserStatus, UserType } from "./enums";
interface UserProps {
    type: UserType;
    name: PersonName;
    email: Email;
    phone?: string;
    institutionalNumber?: InstitutionalNumber;
    passwordHash?: string;
    authProvider: AuthMethod;
    applicantPurpose?: ApplicantPurpose;
    departmentId?: Identifier;
    preferredLang: string;
    status: UserStatus;
    lastSyncedAt?: Date;
}
export interface AuthenticatedUser {
    id: string;
    email: string;
    status: UserStatus;
    authProvider: AuthMethod;
}
export interface UserSnapshot {
    type: UserType;
    fullNameAr: string;
    fullNameEn?: string;
    email: string;
    phone?: string;
    institutionalNumber?: string;
    passwordHash?: string;
    authProvider: AuthMethod;
    applicantPurpose?: ApplicantPurpose;
    departmentId?: string;
    preferredLang: string;
    status: UserStatus;
    lastSyncedAt?: Date;
}
export declare class User extends AggregateRoot {
    private props;
    private constructor();
    static create(id: Identifier, props: UserProps): User;
    static rehydrate(id: Identifier, props: UserProps): User;
    static fromExternal(id: Identifier, p: {
        type: UserType;
        name: PersonName;
        email: Email;
        institutionalNumber: InstitutionalNumber;
        authProvider: AuthMethod;
        phone?: string;
        departmentId?: Identifier;
        preferredLang?: string;
        syncedAt: Date;
    }): User;
    hasLocalPassword(): boolean;
    get passwordHash(): string | undefined;
    get status(): UserStatus;
    get authProvider(): AuthMethod;
    setPasswordHash(hash: string): void;
    suspend(): void;
    activate(): void;
    changeEmail(email: Email): void;
    markSynced(at: Date): void;
    upgradeToDirectoryUser(p: {
        type: UserType;
        institutionalNumber: InstitutionalNumber;
        name?: PersonName;
        email?: Email;
        phone?: string;
        departmentId?: Identifier;
        syncedAt: Date;
    }): void;
    get type(): UserType;
    applyDirectoryUpdate(p: {
        name?: PersonName;
        email?: Email;
        departmentId?: Identifier;
    }, syncedAt: Date): void;
    toAuthenticated(): AuthenticatedUser;
    snapshot(): UserSnapshot;
}
export {};
