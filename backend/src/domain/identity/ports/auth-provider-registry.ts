import { AuthProvider } from './auth-provider'

/**
 * Resolves an AuthProvider by its key (the value stored in users.auth_provider).
 * Adding LDAP/OTP later means registering a new provider here — no changes to
 * the authenticate use case.
 */
export interface AuthProviderRegistry {
  get(key: string): AuthProvider
}
