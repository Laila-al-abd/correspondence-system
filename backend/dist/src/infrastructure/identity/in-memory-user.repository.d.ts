import { User } from '../../domain/identity/user';
import { UserRepository } from '../../domain/identity/ports/user.repository';
import { Email } from '../../domain/identity/value-objects/email';
import { InstitutionalNumber } from '../../domain/identity/value-objects/institutional-number';
import { Identifier } from '../../domain/shared/identifier';
export declare class InMemoryUserRepository implements UserRepository {
    private readonly byId;
    findById(id: Identifier): Promise<User | null>;
    findByEmail(email: Email): Promise<User | null>;
    findByInstitutionalNumber(n: InstitutionalNumber): Promise<User | null>;
    save(aggregate: User): Promise<void>;
}
