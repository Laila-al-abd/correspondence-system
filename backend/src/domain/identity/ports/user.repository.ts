import { Repository } from "../../shared/repository"
import { User } from "../user"
import { Email } from "../value-objects/email"
import { InstitutionalNumber } from "../value-objects/institutional-number"
export interface UserRepository extends Repository<User> {
findByEmail(email: Email): Promise<User | null>
findByInstitutionalNumber(n: InstitutionalNumber): Promise<
User | null>
}