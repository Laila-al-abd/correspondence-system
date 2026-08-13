import { AuthenticatedUser } from "../user";
export interface AuthProvider {
    readonly key: string;
    authenticate(credentials: Record<string, unknown>): Promise<AuthenticatedUser>;
}
