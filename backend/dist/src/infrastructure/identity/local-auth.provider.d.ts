import { AuthProvider } from '../../domain/identity/ports/auth-provider';
import type { UserRepository } from '../../domain/identity/ports/user.repository';
import type { PasswordHasher } from '../../domain/identity/ports/password-hasher';
import { AuthenticatedUser } from '../../domain/identity/user';
export declare class LocalAuthProvider implements AuthProvider {
    private readonly users;
    private readonly hasher;
    readonly key = "LOCAL";
    constructor(users: UserRepository, hasher: PasswordHasher);
    authenticate(credentials: Record<string, unknown>): Promise<AuthenticatedUser>;
}
