import { PasswordHasher } from '../../domain/identity/ports/password-hasher';
export declare class BcryptPasswordHasher implements PasswordHasher {
    private readonly rounds;
    hash(plain: string): Promise<string>;
    compare(plain: string, hash: string): Promise<boolean>;
}
