import 'dotenv/config'
import * as bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

/**
 * System seed: the reference data the ICS needs to run, plus a small demo set
 * so every endpoint can be exercised end to end.
 *
 * There is no HTTP endpoint yet to create sensitivity levels, categories,
 * action types, org-unit types, attribute definitions, templates or roles, so
 * this file is the single source of that configuration data.
 *
 * Two clearly-marked sections:
 *   1) REFERENCE DATA  — belongs in every environment (prod included).
 *   2) DEMO DATA       — a bootstrap admin, one template and sample attributes
 *                        so you can test the flow. Remove/replace for prod.
 *
 * Idempotent: every write is an upsert keyed on a stable id or unique column,
 * so it is safe to run repeatedly. Runs outside Nest, so dotenv/config loads
 * DATABASE_URL and we use the same pg driver adapter as the app.
 */
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

// Bilingual helper: every *.name / *.label column is JSONB { ar, en }.
const t = (ar: string, en: string) => ({ ar, en })

async function main(): Promise<void> {
  // ==========================================================================
  // 1) REFERENCE DATA
  // ==========================================================================

  // --- Languages (User.preferredLang is a FK to languages.code) -------------
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
  await prisma.language.upsert({
    where: { code: 'en' },
    update: {},
    create: {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      isEnabled: true,
      isDefault: false,
    },
  })

  // --- Request reference-number format --------------------------------------
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

  // --- Sensitivity levels (rank is unique; higher = more sensitive) ---------
  const sensitivity = [
    { id: 1n, rank: 1, name: t('عام', 'Public') },
    { id: 2n, rank: 2, name: t('داخلي', 'Internal') },
    { id: 3n, rank: 3, name: t('سري', 'Confidential') },
    { id: 4n, rank: 4, name: t('سري للغاية', 'Secret') },
  ]
  for (const s of sensitivity) {
    await prisma.sensitivityLevel.upsert({
      where: { rank: s.rank },
      update: {},
      create: { id: s.id, rank: s.rank, name: s.name },
    })
  }

  // --- Request categories ---------------------------------------------------
  const categories = [
    { id: 1n, name: t('إداري', 'Administrative') },
    { id: 2n, name: t('أكاديمي', 'Academic') },
    { id: 3n, name: t('مالي', 'Financial') },
  ]
  for (const c of categories) {
    await prisma.requestCategory.upsert({
      where: { id: c.id },
      update: {},
      create: { id: c.id, name: c.name },
    })
  }

  // --- Action types (isTerminal ends the request) ---------------------------
  const actionTypes = [
    { id: 1n, code: 'APPROVE', name: t('موافقة', 'Approve'), isTerminal: true },
    { id: 2n, code: 'REJECT', name: t('رفض', 'Reject'), isTerminal: true },
    { id: 3n, code: 'FORWARD', name: t('إحالة', 'Forward'), isTerminal: false },
    { id: 4n, code: 'RETURN', name: t('إعادة', 'Return'), isTerminal: false },
    { id: 5n, code: 'SIGN', name: t('توقيع', 'Sign'), isTerminal: false },
    {
      id: 6n,
      code: 'REQUEST_PAYMENT',
      name: t('طلب دفع', 'Request payment'),
      isTerminal: false,
    },
    {
      id: 7n,
      code: 'CONFIRM_PAYMENT',
      name: t('تأكيد دفع', 'Confirm payment'),
      isTerminal: false,
    },
  ]
  for (const a of actionTypes) {
    await prisma.actionType.upsert({
      where: { code: a.code },
      update: {},
      create: { id: a.id, code: a.code, name: a.name, isTerminal: a.isTerminal },
    })
  }

  // --- Org-unit types -------------------------------------------------------
  const unitTypes = [
    { id: 1n, code: 'UNIVERSITY', name: t('جامعة', 'University') },
    { id: 2n, code: 'FACULTY', name: t('كلية', 'Faculty') },
    { id: 3n, code: 'DEPARTMENT', name: t('قسم', 'Department') },
    { id: 4n, code: 'UNIT', name: t('وحدة', 'Unit') },
    { id: 5n, code: 'OFFICE', name: t('مكتب', 'Office') },
  ]
  for (const u of unitTypes) {
    await prisma.orgUnitType.upsert({
      where: { code: u.code },
      update: {},
      create: { id: u.id, code: u.code, name: u.name },
    })
  }

  // --- ABAC attribute vocabulary --------------------------------------------
  const attributes = [
    { id: 1n, code: 'user_type', label: t('نوع المستخدم', 'User type'), dataType: 'TEXT' },
    { id: 2n, code: 'degree_level', label: t('المرحلة الدراسية', 'Degree level'), dataType: 'ENUM' },
    { id: 3n, code: 'gpa', label: t('المعدل التراكمي', 'GPA'), dataType: 'NUMBER' },
    { id: 4n, code: 'clearance_level', label: t('مستوى التصريح', 'Clearance level'), dataType: 'NUMBER' },
  ]
  for (const a of attributes) {
    await prisma.attributeDefinition.upsert({
      where: { code: a.code },
      update: {},
      create: { id: a.id, code: a.code, label: a.label, dataType: a.dataType },
    })
  }

  // --- RBAC: permission group, permissions, role ----------------------------
  const group = await prisma.permissionGroup.upsert({
    where: { id: 1n },
    update: {},
    create: { id: 1n, name: t('إدارة الوصول', 'Access Management') },
  })

  const permissions = [
    { id: 1n, code: 'user.manage', name: t('إدارة المستخدمين', 'Manage users') },
    { id: 2n, code: 'request.read', name: t('قراءة الطلبات', 'Read requests') },
    { id: 3n, code: 'request.act', name: t('التصرف بالطلبات', 'Act on requests') },
    { id: 4n, code: 'workflow.manage', name: t('إدارة مسارات العمل', 'Manage workflows') },
    { id: 5n, code: 'template.manage', name: t('إدارة القوالب', 'Manage templates') },
  ]
  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: {},
      create: { id: p.id, groupId: group.id, code: p.code, name: p.name },
    })
  }

  const role = await prisma.role.upsert({
    where: { id: 1n },
    update: {},
    create: { id: 1n, name: t('مدير النظام', 'Administrator'), isSystem: true },
  })

  // Administrator carries every permission above.
  for (const p of permissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
      update: {},
      create: { roleId: role.id, permissionId: p.id },
    })
  }

  // ==========================================================================
  // 2) DEMO DATA (replace for production)
  // ==========================================================================

  // --- Bootstrap admin you can log in as ------------------------------------
  // Email:    admin@correspondence.local
  // Password: Admin@12345      <-- change this after first login
  const passwordHash = await bcrypt.hash('Admin@12345', 10)
  const user = await prisma.user.upsert({
    where: { email: 'admin@correspondence.local' },
    update: { passwordHash },
    create: {
      id: 1n,
      userType: 'ADMIN',
      fullNameAr: 'مدير النظام',
      fullNameEn: 'System Administrator',
      institutionalNumber: 'STF-0001',
      email: 'admin@correspondence.local',
      passwordHash,
      authProvider: 'LOCAL',
      preferredLang: 'ar',
      status: 'ACTIVE',
    },
  })

  // Admin -> Administrator role. The compound unique includes assignedAt +
  // nullable departmentId, so clear-then-create instead of upsert.
  await prisma.userRole.deleteMany({ where: { userId: user.id, roleId: role.id } })
  await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } })

  // --- Sample attribute values for the admin (so ABAC returns eligible) -----
  const userAttrValues = [
    { attributeId: 1n, value: 'EMPLOYEE' },
    { attributeId: 4n, value: 3 },
  ]
  for (const ua of userAttrValues) {
    await prisma.userAttribute.upsert({
      where: {
        userId_attributeId: { userId: user.id, attributeId: ua.attributeId },
      },
      update: { value: ua.value },
      create: { userId: user.id, attributeId: ua.attributeId, value: ua.value },
    })
  }

  // --- One demo template (Academic, Internal) with fields + eligibility -----
  await prisma.template.upsert({
    where: { id: 1n },
    update: {},
    create: {
      id: 1n,
      categoryId: 2n, // Academic
      sensitivityLevelId: 2n, // Internal
      title: t('طلب شهادة عدم ممانعة', 'No-objection certificate request'),
      isActive: true,
    },
  })

  const fields = [
    {
      id: 1n,
      fieldKey: 'reason',
      label: t('السبب', 'Reason'),
      dataType: 'TEXT',
      isRequired: true,
      ordinal: 1,
    },
    {
      id: 2n,
      fieldKey: 'destination',
      label: t('الجهة', 'Destination'),
      dataType: 'TEXT',
      isRequired: false,
      ordinal: 2,
    },
  ]
  for (const f of fields) {
    await prisma.templateField.upsert({
      where: { templateId_fieldKey: { templateId: 1n, fieldKey: f.fieldKey } },
      update: {},
      create: {
        id: f.id,
        templateId: 1n,
        fieldKey: f.fieldKey,
        label: f.label,
        dataType: f.dataType,
        isRequired: f.isRequired,
        ordinal: f.ordinal,
      },
    })
  }

  // Eligible only if user_type == EMPLOYEE AND clearance_level >= 2.
  const rules = [
    {
      id: 1n,
      attributeId: 1n,
      operator: 'EQ',
      value: 'EMPLOYEE',
      description: t('الموظفون فقط', 'Employees only'),
    },
    {
      id: 2n,
      attributeId: 4n,
      operator: 'GTE',
      value: 2,
      description: t('مستوى التصريح 2 على الأقل', 'Clearance level 2 or higher'),
    },
  ]
  for (const r of rules) {
    await prisma.templateEligibilityRule.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        templateId: 1n,
        attributeId: r.attributeId,
        operator: r.operator,
        value: r.value,
        description: r.description,
      },
    })
  }

  console.log('Seed complete.')
  console.log('  Admin login : admin@correspondence.local / Admin@12345')
  console.log(`  Admin id    : ${user.id}`)
  console.log('  Demo template id: 1 (Academic / Internal)')
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
