/**
 * Outbound port for password hashing. The domain expresses the need; the
 * infrastructure layer chooses the algorithm (bcrypt, argon2, ...).
 */
export interface PasswordHasher {
  hash(plain: string): Promise<string>
  compare(plain: string, hash: string): Promise<boolean>
}