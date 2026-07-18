import { AuthenticatedUser } from "../user"
// The Strategy port. LocalAuthProvider, LdapAuthProvider, Ot
//pAuthProvider each implement it.
export interface AuthProvider {
readonly key: string                      
authenticate(credentials: Record<string, unknown>): Promise<AuthenticatedUser>
}