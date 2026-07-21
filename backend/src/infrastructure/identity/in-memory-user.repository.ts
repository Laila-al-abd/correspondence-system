import { Injectable } from '@nestjs/common'
import { User } from '../../domain/identity/user'
import { UserRepository } from '../../domain/identity/ports/user.repository'
import { Email } from '../../domain/identity/value-objects/email'
import { InstitutionalNumber } from '../../domain/identity/value-objects/institutional-number'
import { Identifier } from '../../domain/shared/identifier'

/**
 * TEMPORARY adapter. In-memory repositories for unit tests.
 */
@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly byId = new Map<string, User>()

  async findById(id: Identifier): Promise<User | null> {
    return this.byId.get(id.toString()) ?? null
  }

  async findByEmail(email: Email): Promise<User | null> {
    for (const user of this.byId.values()) {
      if (user.toAuthenticated().email === email.value) return user
    }
    return null
  }

  async findByInstitutionalNumber(
    n: InstitutionalNumber,
  ): Promise<User | null> {
    // Institutional number is not exposed on the aggregate's public surface yet;
    // extend User with a getter when a use case needs this lookup.
    void n
    return null
  }

  async save(aggregate: User): Promise<void> {
    this.byId.set(aggregate.id.toString(), aggregate)
  }
}
