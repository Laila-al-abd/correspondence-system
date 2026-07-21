import { User } from '../../domain/identity/user'
import { Identifier } from '../../domain/shared/identifier'
import { Email } from '../../domain/identity/value-objects/email'
import { PersonName } from '../../domain/identity/value-objects/person-name'
import { InstitutionalNumber } from '../../domain/identity/value-objects/institutional-number'
import { ApplicantPurpose, UserStatus, UserType } from '../../domain/identity/enums'
import type { Prisma, User as UserRow } from '../../../generated/prisma/client'

/**
 * Translates between the User aggregate and the Prisma `users` row. Value
 * objects are rebuilt through their factories; ids move between Identifier and
 * BIGINT. Audit/unused columns (created_at, signature_key) are left to the DB.
 */
export const UserMapper = {
  toDomain(row: UserRow): User {
    return User.rehydrate(Identifier.of(row.id), {
      type: row.userType as UserType,
      name: PersonName.create(row.fullNameAr, row.fullNameEn ?? undefined),
      email: Email.create(row.email),
      phone: row.phone ?? undefined,
      institutionalNumber: row.institutionalNumber
        ? InstitutionalNumber.create(row.institutionalNumber)
        : undefined,
      passwordHash: row.passwordHash ?? undefined,
      authProvider: row.authProvider,
      applicantPurpose:
        (row.applicantPurpose as ApplicantPurpose | null) ?? undefined,
      departmentId: row.departmentId ? Identifier.of(row.departmentId) : undefined,
      preferredLang: row.preferredLang,
      status: row.status as UserStatus,
      lastSyncedAt: row.lastSyncedAt ?? undefined,
    })
  },

  toPersistence(user: User): Prisma.UserUncheckedCreateInput {
    const s = user.snapshot()
    return {
      id: BigInt(user.id.toString()),
      userType: s.type,
      fullNameAr: s.fullNameAr,
      fullNameEn: s.fullNameEn ?? null,
      institutionalNumber: s.institutionalNumber ?? null,
      email: s.email,
      phone: s.phone ?? null,
      passwordHash: s.passwordHash ?? null,
      authProvider: s.authProvider,
      applicantPurpose: s.applicantPurpose ?? null,
      departmentId: s.departmentId ? BigInt(s.departmentId) : null,
      preferredLang: s.preferredLang,
      status: s.status,
      lastSyncedAt: s.lastSyncedAt ?? null,
    }
  },
}
