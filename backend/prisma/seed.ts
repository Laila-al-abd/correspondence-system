import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

/**
 * Development seed: the smallest data set that exercises RBAC end to end.
 *
 *   PermissionGroup → Permission(user.manage)
 *              Role(Administrator) ──RolePermission──▶ Permission
 *              User(id 1) ──UserRole──▶ Role
 *
 * After running it, `effectivePermissions(1)` resolves to { 'user.manage' },
 * so GET /auth/me/permissions returns ["user.manage"] and the guarded
 * GET /auth/admin/ping returns 200 for header `x-user-id: 1`.
 *
 * Idempotent: every write is an upsert (or clear-then-create), so it is safe to
 * run repeatedly. Uses the same pg driver adapter as the app; dotenv/config
 * loads DATABASE_URL because this runs outside Nest.
 */
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

async function main(): Promise<void> {
  // Language 'ar' — User.preferredLang is a FK to languages.code.
  await prisma.language.upsert({
    where: { code: 'ar' },
    update: {},
    create: {
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      isEnabled: true,
      isDefault: true,
    },
  })

  // Request numbering — the institution's customizable reference-number format.
  // The generator falls back to sensible defaults when this row is absent.
  await prisma.systemSetting.upsert({
    where: { key: 'request_numbering' },
    update: {},
    create: {
      key: 'request_numbering',
      value: {
        pattern: '{prefix}/{year}/{seq}',
        prefix: 'HIAST',
        seqPadding: 5,
        resetPolicy: 'YEARLY',
        yearDigits: 4,
      },
      description: 'Customizable request reference-number format.',
    },
  })

  // Permission group — Permission.groupId is required (FK to permission_groups).
  const group = await prisma.permissionGroup.upsert({
    where: { id: 1n },
    update: {},
    create: {
      id: 1n,
      name: { ar: 'إدارة الوصول', en: 'Access Management' },
    },
  })

  // The permission the demo route requires.
  const permission = await prisma.permission.upsert({
    where: { code: 'user.manage' },
    update: {},
    create: {
      id: 1n,
      groupId: group.id,
      code: 'user.manage',
      name: { ar: 'إدارة المستخدمين', en: 'Manage users' },
    },
  })

  // A role that carries it.
  const role = await prisma.role.upsert({
    where: { id: 1n },
    update: {},
    create: {
      id: 1n,
      name: { ar: 'مدير النظام', en: 'Administrator' },
      isSystem: true,
    },
  })

  // Role → Permission.
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: { roleId: role.id, permissionId: permission.id },
    },
    update: {},
    create: { roleId: role.id, permissionId: permission.id },
  })

  // The admin user you will authenticate as (x-user-id: 1).
  const user = await prisma.user.upsert({
    where: { email: 'admin@correspondence.local' },
    update: {},
    create: {
      id: 1n,
      userType: 'ADMIN',
      fullNameAr: 'مدير النظام',
      fullNameEn: 'System Administrator',
      email: 'admin@correspondence.local',
      authProvider: 'LOCAL',
      preferredLang: 'ar',
      status: 'ACTIVE',
    },
  })

  // User → Role. The compound unique includes assignedAt + nullable
  // departmentId, which makes a plain upsert awkward, so clear this pair first.
  await prisma.userRole.deleteMany({
    where: { userId: user.id, roleId: role.id },
  })
  await prisma.userRole.create({
    data: { userId: user.id, roleId: role.id },
  })

  console.log('Seed complete.')
  console.log(`  user id    = ${user.id} (send as header  x-user-id: ${user.id})`)
  console.log(`  role       = ${role.id} (Administrator)`)
  console.log(`  permission = ${permission.code}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
