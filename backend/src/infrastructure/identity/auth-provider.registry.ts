import { AuthProvider } from '../../domain/identity/ports/auth-provider'
import { AuthProviderRegistry } from '../../domain/identity/ports/auth-provider-registry'
import { UnsupportedAuthMethodError } from '../../application/errors'

/**
 * Holds the registered auth providers keyed by their `key`. Constructed in
 * IdentityModule from the list of available providers.
 */
export class AuthProviderRegistryImpl implements AuthProviderRegistry {
  private readonly providers = new Map<string, AuthProvider>()

  constructor(providers: AuthProvider[]) {
    for (const provider of providers) {
      this.providers.set(provider.key, provider)
    }
  }

  get(key: string): AuthProvider {
    const provider = this.providers.get(key)
    if (!provider) throw new UnsupportedAuthMethodError(key)
    return provider
  }
}
