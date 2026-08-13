import { AuthProvider } from './auth-provider';
export interface AuthProviderRegistry {
    get(key: string): AuthProvider;
}
