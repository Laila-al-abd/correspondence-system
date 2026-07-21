import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { PasswordHasher } from '../../domain/identity/ports/password-hasher'

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  private readonly rounds = 10

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.rounds)
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash)
  }
}
