import { AuthProvider } from '../../domain/identity/ports/auth-provider';
import { AuthProviderRegistry } from '../../domain/identity/ports/auth-provider-registry';
export declare class AuthProviderRegistryImpl implements AuthProviderRegistry {
    private readonly providers;
    constructor(providers: AuthProvider[]);
    get(key: string): AuthProvider;
}
