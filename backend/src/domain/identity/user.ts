import { AggregateRoot } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { InvariantViolationError } from "../shared/domain-error"
import { Email } from "./value-objects/email"
import { InstitutionalNumber } from "./value-objects/institutional-number"
import { PersonName } from "./value-objects/person-name"
import { AuthMethod, ApplicantPurpose, UserStatus, UserType } 
from "./enums"
interface UserProps {
type: UserType
name: PersonName
email: Email
phone?: string
institutionalNumber?: InstitutionalNumber
passwordHash?: string
authProvider: AuthMethod
applicantPurpose?: ApplicantPurpose
departmentId?: Identifier
preferredLang: string
status: UserStatus
lastSyncedAt?: Date
}

export interface AuthenticatedUser {
id: string; email: string; status: UserStatus; authProvider: AuthMethod
}
export interface UserSnapshot {
type: UserType
fullNameAr: string
fullNameEn?: string
email: string
phone?: string
institutionalNumber?: string
passwordHash?: string
authProvider: AuthMethod
applicantPurpose?: ApplicantPurpose
departmentId?: string
preferredLang: string
status: UserStatus
lastSyncedAt?: Date
}
export class User extends AggregateRoot {
private constructor(id: Identifier, private props: UserProps) { super(id) }
/** Create a brand-new user, enforcing invariants. */
static create(id: Identifier, props: UserProps): User {
if (props.type === UserType.APPLICANT && props.institutionalNumber)
throw new InvariantViolationError("Applicants must not have an institutional number.")
if (props.type !== UserType.APPLICANT && !props.institutionalNumber)
throw new InvariantViolationError("Students and employees require an institutional number.")
if (props.authProvider === "LOCAL" && !props.passwordHash)
throw new InvariantViolationError("LOCAL auth requires a password hash.")
if (props.applicantPurpose && props.type !== UserType.APPLICANT)
throw new InvariantViolationError("applicantPurpose is only valid for applicants.")
return new User(id, props)
}
/** Rebuild from persistence without re-running creation guards. */
static rehydrate(id: Identifier, props: UserProps): User { 
return new User(id, props) }
// ----- behaviour ----
hasLocalPassword(): boolean { return !!this.props.passwordHash }
get passwordHash(): string | undefined { return this.props.
passwordHash }
get status(): UserStatus { return this.props.status }
get authProvider(): AuthMethod { return this.props.authProvider }
setPasswordHash(hash: string): void {
if (this.props.authProvider !== "LOCAL")
throw new InvariantViolationError("Only LOCAL users can set a local password.")
this.props.passwordHash = hash
}
suspend(): void { this.props.status = UserStatus.SUSPENDED 
}
activate(): void { this.props.status = UserStatus.ACTIVE }
changeEmail(email: Email): void { this.props.email = email 
}
markSynced(at: Date): void { this.props.lastSyncedAt = at }
toAuthenticated(): AuthenticatedUser {
return {
id: this.id.toString(),
email: this.props.email.value,
status: this.props.status,
authProvider: this.props.authProvider,
}
}
/** Flat, primitive view of the user for the persistence mapper. */
snapshot(): UserSnapshot {
return {
type: this.props.type,
fullNameAr: this.props.name.ar,
fullNameEn: this.props.name.en,
email: this.props.email.value,
phone: this.props.phone,
institutionalNumber: this.props.institutionalNumber?.value,
passwordHash: this.props.passwordHash,
authProvider: this.props.authProvider,
applicantPurpose: this.props.applicantPurpose,
departmentId: this.props.departmentId?.toString(),
preferredLang: this.props.preferredLang,
status: this.props.status,
lastSyncedAt: this.props.lastSyncedAt,
}
}
}