import { ConfigService } from '@nestjs/config';
import { AuthProvider } from '../../domain/identity/ports/auth-provider';
import type { UserRepository } from '../../domain/identity/ports/user.repository';
import { AuthenticatedUser } from '../../domain/identity/user';
export declare const DIRECTORY_PROVIDER_KEY = "LDAP";
export declare class DirectoryAuthProvider implements AuthProvider {
    private readonly users;
    private readonly config;
    readonly key = "LDAP";
    private readonly logger;
    constructor(users: UserRepository, config: ConfigService);
    authenticate(credentials: Record<string, unknown>): Promise<AuthenticatedUser>;
}
