"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const bcrypt = __importStar(require("bcryptjs"));
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../generated/prisma/client");
const system_actor_1 = require("../src/infrastructure/shared/system-actor");
const prisma = new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const t = (ar, en) => ({ ar, en });
const seedId = (table, row) => `00000000-0000-7000-8000-${table.toString(16).padStart(4, '0')}${row
    .toString(16)
    .padStart(8, '0')}`;
const SEED_TABLE = {
    sensitivityLevel: 1,
    requestCategory: 2,
    actionType: 3,
    orgUnitType: 4,
    attributeDefinition: 5,
    permissionGroup: 6,
    permission: 7,
    role: 8,
    user: 9,
    template: 10,
    templateField: 11,
    eligibilityRule: 12,
    workflowPath: 13,
    workflowStep: 14,
    systemSetting: 15,
};
const sensitivityId = (n) => seedId(SEED_TABLE.sensitivityLevel, n);
const categoryId = (n) => seedId(SEED_TABLE.requestCategory, n);
const actionTypeId = (n) => seedId(SEED_TABLE.actionType, n);
const unitTypeId = (n) => seedId(SEED_TABLE.orgUnitType, n);
const attributeId = (n) => seedId(SEED_TABLE.attributeDefinition, n);
const permissionGroupId = (n) => seedId(SEED_TABLE.permissionGroup, n);
const permissionId = (n) => seedId(SEED_TABLE.permission, n);
const roleId = (n) => seedId(SEED_TABLE.role, n);
const userId = (n) => seedId(SEED_TABLE.user, n);
const templateId = (n) => seedId(SEED_TABLE.template, n);
const templateFieldId = (n) => seedId(SEED_TABLE.templateField, n);
const eligibilityRuleId = (n) => seedId(SEED_TABLE.eligibilityRule, n);
const workflowPathId = (n) => seedId(SEED_TABLE.workflowPath, n);
const workflowStepId = (n) => seedId(SEED_TABLE.workflowStep, n);
const loadCatalogue = () => {
    const path = (0, node_path_1.join)(__dirname, 'seed-data', 'template-catalogue.json');
    return JSON.parse((0, node_fs_1.readFileSync)(path, 'utf8'));
};
async function main() {
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
    });
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
    });
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
    });
    await prisma.systemSetting.upsert({
        where: { key: 'sla_thresholds' },
        update: {},
        create: {
            key: 'sla_thresholds',
            value: { atRiskHours: 8 },
            description: 'Working hours of remaining time below which a step counts as at risk.',
        },
    });
    await prisma.systemSetting.upsert({
        where: { key: 'working_hours' },
        update: {},
        create: {
            id: seedId(SEED_TABLE.systemSetting, 1),
            key: 'working_hours',
            value: {
                enabled: false,
                days: [0, 1, 2, 3, 4],
                start: '08:00',
                end: '15:30',
                timezone: 'Asia/Damascus',
            },
            description: 'Weekly working-hours policy. days uses 0=Sunday; times are wall-clock in timezone. enabled=false lifts the working-hours restriction on staff actions.',
        },
    });
    const sensitivity = [
        { id: sensitivityId(1), rank: 1, name: t('عام', 'Public') },
        { id: sensitivityId(2), rank: 2, name: t('داخلي', 'Internal') },
        { id: sensitivityId(3), rank: 3, name: t('سري', 'Confidential') },
        { id: sensitivityId(4), rank: 4, name: t('سري للغاية', 'Secret') },
    ];
    for (const s of sensitivity) {
        await prisma.sensitivityLevel.upsert({
            where: { rank: s.rank },
            update: {},
            create: { id: s.id, rank: s.rank, name: s.name },
        });
    }
    const categories = [
        { id: categoryId(1), name: t('إداري', 'Administrative') },
        { id: categoryId(2), name: t('أكاديمي', 'Academic') },
        { id: categoryId(3), name: t('مالي', 'Financial') },
    ];
    for (const c of categories) {
        await prisma.requestCategory.upsert({
            where: { id: c.id },
            update: {},
            create: { id: c.id, name: c.name },
        });
    }
    const actionTypes = [
        { id: actionTypeId(1), code: 'APPROVE', name: t('موافقة', 'Approve'), isTerminal: true },
        { id: actionTypeId(2), code: 'REJECT', name: t('رفض', 'Reject'), isTerminal: true },
        { id: actionTypeId(3), code: 'FORWARD', name: t('إحالة', 'Forward'), isTerminal: false },
        { id: actionTypeId(4), code: 'RETURN', name: t('إعادة', 'Return'), isTerminal: false },
        { id: actionTypeId(5), code: 'SIGN', name: t('توقيع', 'Sign'), isTerminal: false },
        {
            id: actionTypeId(6),
            code: 'REQUEST_PAYMENT',
            name: t('طلب دفع', 'Request payment'),
            isTerminal: false,
        },
        {
            id: actionTypeId(7),
            code: 'CONFIRM_PAYMENT',
            name: t('تأكيد دفع', 'Confirm payment'),
            isTerminal: false,
        },
        {
            id: actionTypeId(9),
            code: 'WAIVE_PAYMENT',
            name: t('إعفاء من الرسم', 'Waive fee'),
            isTerminal: false,
        },
        {
            id: actionTypeId(8),
            code: 'CHANGE_PRIORITY',
            name: t('تغيير الأولوية', 'Change priority'),
            isTerminal: false,
        },
    ];
    for (const a of actionTypes) {
        await prisma.actionType.upsert({
            where: { code: a.code },
            update: {},
            create: { id: a.id, code: a.code, name: a.name, isTerminal: a.isTerminal },
        });
    }
    const unitTypes = [
        { id: unitTypeId(1), code: 'UNIVERSITY', name: t('جامعة', 'University') },
        { id: unitTypeId(2), code: 'FACULTY', name: t('كلية', 'Faculty') },
        { id: unitTypeId(3), code: 'DEPARTMENT', name: t('قسم', 'Department') },
        { id: unitTypeId(4), code: 'UNIT', name: t('وحدة', 'Unit') },
        { id: unitTypeId(5), code: 'OFFICE', name: t('مكتب', 'Office') },
    ];
    for (const u of unitTypes) {
        await prisma.orgUnitType.upsert({
            where: { code: u.code },
            update: {},
            create: { id: u.id, code: u.code, name: u.name },
        });
    }
    const attributes = [
        { id: attributeId(1), code: 'user_type', label: t('نوع المستخدم', 'User type'), dataType: 'TEXT' },
        { id: attributeId(2), code: 'degree_level', label: t('المرحلة الدراسية', 'Degree level'), dataType: 'ENUM' },
        { id: attributeId(3), code: 'gpa', label: t('المعدل التراكمي', 'GPA'), dataType: 'NUMBER' },
        { id: attributeId(4), code: 'clearance_level', label: t('مستوى التصريح', 'Clearance level'), dataType: 'NUMBER' },
    ];
    for (const a of attributes) {
        await prisma.attributeDefinition.upsert({
            where: { code: a.code },
            update: {},
            create: { id: a.id, code: a.code, label: a.label, dataType: a.dataType },
        });
    }
    const degreeLevelOptions = [
        { value: 'BACHELOR', label: t('بكالوريوس', "Bachelor's"), ordinal: 1 },
        { value: 'MASTER', label: t('ماجستير', "Master's"), ordinal: 2 },
        { value: 'PHD', label: t('دكتوراه', 'PhD'), ordinal: 3 },
    ];
    for (const opt of degreeLevelOptions) {
        await prisma.attributeOption.upsert({
            where: {
                attributeId_value: { attributeId: attributeId(2), value: opt.value },
            },
            update: { label: opt.label, ordinal: opt.ordinal },
            create: {
                id: crypto.randomUUID(),
                attributeId: attributeId(2),
                value: opt.value,
                label: opt.label,
                ordinal: opt.ordinal,
            },
        });
    }
    const group = await prisma.permissionGroup.upsert({
        where: { id: permissionGroupId(1) },
        update: {},
        create: {
            id: permissionGroupId(1),
            name: t('إدارة الوصول', 'Access Management'),
            description: t('الصلاحيات التي تحدد ما يمكن لكل دور فعله في النظام.', 'Permissions that decide what each role is allowed to do.'),
        },
    });
    const permissions = [
        { id: permissionId(1), code: 'user.manage', name: t('إدارة المستخدمين', 'Manage users') },
        { id: permissionId(2), code: 'request.read', name: t('قراءة الطلبات', 'Read requests') },
        { id: permissionId(3), code: 'request.act', name: t('التصرف بالطلبات', 'Act on requests') },
        { id: permissionId(4), code: 'workflow.manage', name: t('إدارة مسارات العمل', 'Manage workflows') },
        { id: permissionId(5), code: 'template.manage', name: t('إدارة القوالب', 'Manage templates') },
        { id: permissionId(6), code: 'reports.view', name: t('عرض التقارير', 'View reports') },
        { id: permissionId(7), code: 'request.classify', name: t('تصنيف الطلبات', 'Classify requests') },
        { id: permissionId(8), code: 'system.monitor', name: t('مراقبة النظام', 'Monitor the system') },
        { id: permissionId(9), code: 'role.manage', name: t('إدارة الأدوار', 'Manage roles') },
        { id: permissionId(10), code: 'payment.settle', name: t('تسوية الرسوم', 'Settle fees') },
    ];
    const permissionDescriptions = {
        'user.manage': {
            ar: 'إنشاء المستخدمين وتعديل بياناتهم وتعطيلهم، وإدارة الوحدات التنظيمية.',
            en: 'Create, edit and deactivate users, and manage organizational units.',
        },
        'request.read': {
            ar: 'عرض الطلبات وقوائم العمل وتفاصيل الطلب دون إمكانية التصرف بها.',
            en: 'View requests, work queues and request details, without acting on them.',
        },
        'request.act': {
            ar: 'بدء خطوات الطلب وإكمالها ورفضها وتخصيصها، وتغيير أولوية الطلب.',
            en: 'Start, complete, reject and assign request steps, and change a request priority.',
        },
        'workflow.manage': {
            ar: 'تعريف مسارات العمل وخطواتها والمسؤولين عنها ومهل الإنجاز.',
            en: 'Define workflow paths, their steps, assignees and SLA targets.',
        },
        'template.manage': {
            ar: 'إنشاء قوالب الطلبات وحقولها وشروط الأهلية وتعديلها.',
            en: 'Create and edit request templates, their fields and eligibility rules.',
        },
        'reports.view': {
            ar: 'عرض التقارير ولوحات المؤشرات وتصديرها.',
            en: 'View and export reports and indicator dashboards.',
        },
        'request.classify': {
            ar: 'تصنيف الطلبات المحوَّلة للمراجعة البشرية وتعبئة حقولها المستخرجة.',
            en: 'Classify requests routed to human review and fill their extracted fields.',
        },
        'system.monitor': {
            ar: 'الاطلاع على صحة النظام التفصيلية وتشغيل مهام الصيانة.',
            en: 'Inspect detailed system health and run maintenance jobs.',
        },
        'role.manage': {
            ar: 'إنشاء الأدوار وتحديد صلاحياتها ومنحها للمستخدمين. صلاحية حساسة: من يملكها يستطيع منح نفسه أي صلاحية أخرى.',
            en: 'Create roles, decide what they grant, and assign them. Sensitive: whoever holds it can grant themselves anything else.',
        },
        'payment.settle': {
            ar: 'تأكيد دفع رسوم الطلب أو الإعفاء منها مع تسجيل السبب.',
            en: 'Confirm that a request fee was paid, or waive it with a recorded reason.',
        },
    };
    for (const p of permissions) {
        const described = permissionDescriptions[p.code];
        const description = described ? t(described.ar, described.en) : undefined;
        await prisma.permission.upsert({
            where: { code: p.code },
            update: description ? { description } : {},
            create: {
                id: p.id,
                groupId: group.id,
                code: p.code,
                name: p.name,
                ...(description ? { description } : {}),
            },
        });
    }
    const role = await prisma.role.upsert({
        where: { id: roleId(1) },
        update: {},
        create: {
            id: roleId(1),
            name: t('مدير النظام', 'Administrator'),
            isSystem: true,
        },
    });
    for (const p of permissions) {
        await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
            update: {},
            create: { roleId: role.id, permissionId: p.id },
        });
    }
    await prisma.user.upsert({
        where: { id: system_actor_1.SYSTEM_USER_ID },
        update: { status: 'INACTIVE', passwordHash: null },
        create: {
            id: system_actor_1.SYSTEM_USER_ID,
            userType: 'ADMIN',
            fullNameAr: 'النظام',
            fullNameEn: 'System',
            email: system_actor_1.SYSTEM_USER_EMAIL,
            authProvider: 'SYSTEM',
            preferredLang: 'ar',
            status: 'INACTIVE',
        },
    });
    const passwordHash = await bcrypt.hash('Admin@12345', 10);
    const user = await prisma.user.upsert({
        where: { email: 'admin@correspondence.local' },
        update: { passwordHash },
        create: {
            id: userId(1),
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
    });
    await prisma.userRole.deleteMany({ where: { userId: user.id, roleId: role.id } });
    await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
    const reviewerRole = await prisma.role.upsert({
        where: { id: roleId(2) },
        update: {},
        create: {
            id: roleId(2),
            name: t('مُراجِع', 'Reviewer'),
            isSystem: false,
        },
    });
    for (const id of [permissionId(2), permissionId(3)]) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: reviewerRole.id,
                    permissionId: id,
                },
            },
            update: {},
            create: { roleId: reviewerRole.id, permissionId: id },
        });
    }
    const reviewerPasswordHash = await bcrypt.hash('Review@12345', 10);
    const reviewers = [
        {
            id: userId(2),
            fullNameAr: 'المراجع الأول',
            fullNameEn: 'Reviewer One',
            institutionalNumber: 'STF-0002',
            email: 'reviewer1@correspondence.local',
        },
        {
            id: userId(3),
            fullNameAr: 'المراجع الثاني',
            fullNameEn: 'Reviewer Two',
            institutionalNumber: 'STF-0003',
            email: 'reviewer2@correspondence.local',
        },
    ];
    for (const r of reviewers) {
        const reviewer = await prisma.user.upsert({
            where: { email: r.email },
            update: { passwordHash: reviewerPasswordHash },
            create: {
                id: r.id,
                userType: 'EMPLOYEE',
                fullNameAr: r.fullNameAr,
                fullNameEn: r.fullNameEn,
                institutionalNumber: r.institutionalNumber,
                email: r.email,
                passwordHash: reviewerPasswordHash,
                authProvider: 'LOCAL',
                preferredLang: 'ar',
                status: 'ACTIVE',
            },
        });
        await prisma.userRole.deleteMany({
            where: { userId: reviewer.id, roleId: reviewerRole.id },
        });
        await prisma.userRole.create({
            data: { userId: reviewer.id, roleId: reviewerRole.id },
        });
    }
    const classifierRole = await prisma.role.upsert({
        where: { id: roleId(3) },
        update: {},
        create: {
            id: roleId(3),
            name: t('مصنّف الطلبات', 'Classification Reviewer'),
            isSystem: false,
        },
    });
    for (const id of [permissionId(2), permissionId(7)]) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: { roleId: classifierRole.id, permissionId: id },
            },
            update: {},
            create: { roleId: classifierRole.id, permissionId: id },
        });
    }
    await prisma.userRole.deleteMany({
        where: { userId: userId(2), roleId: classifierRole.id },
    });
    await prisma.userRole.create({
        data: { userId: userId(2), roleId: classifierRole.id },
    });
    const userAttrValues = [
        { attributeId: attributeId(1), value: 'ADMIN' },
        { attributeId: attributeId(4), value: 3 },
    ];
    for (const ua of userAttrValues) {
        await prisma.userAttribute.upsert({
            where: {
                userId_attributeId: { userId: user.id, attributeId: ua.attributeId },
            },
            update: { value: ua.value },
            create: { userId: user.id, attributeId: ua.attributeId, value: ua.value },
        });
    }
    const aiRole = await prisma.role.upsert({
        where: { id: roleId(4) },
        update: {},
        create: {
            id: roleId(4),
            name: t('خدمة الذكاء الاصطناعي', 'AI Service'),
            isSystem: true,
        },
    });
    for (const id of [permissionId(2), permissionId(7)]) {
        await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: aiRole.id, permissionId: id } },
            update: {},
            create: { roleId: aiRole.id, permissionId: id },
        });
    }
    const aiPasswordHash = await bcrypt.hash('change-me', 10);
    const aiUser = await prisma.user.upsert({
        where: { email: 'ai-service@correspondence.local' },
        update: { passwordHash: aiPasswordHash },
        create: {
            id: userId(4),
            userType: 'EMPLOYEE',
            fullNameAr: 'خدمة التصنيف الآلي',
            fullNameEn: 'AI Classification Service',
            institutionalNumber: 'STF-0004',
            email: 'ai-service@correspondence.local',
            passwordHash: aiPasswordHash,
            authProvider: 'LOCAL',
            preferredLang: 'ar',
            status: 'ACTIVE',
        },
    });
    await prisma.userRole.deleteMany({
        where: { userId: aiUser.id, roleId: aiRole.id },
    });
    await prisma.userRole.create({
        data: { userId: aiUser.id, roleId: aiRole.id },
    });
    await prisma.template.upsert({
        where: { id: templateId(1) },
        update: {},
        create: {
            id: templateId(1),
            categoryId: categoryId(2),
            sensitivityLevelId: sensitivityId(2),
            title: t('طلب شهادة عدم ممانعة', 'No-objection certificate request'),
            isActive: true,
        },
    });
    const fields = [
        {
            id: templateFieldId(1),
            fieldKey: 'reason',
            label: t('السبب', 'Reason'),
            dataType: 'TEXT',
            isRequired: true,
            ordinal: 1,
        },
        {
            id: templateFieldId(2),
            fieldKey: 'destination',
            label: t('الجهة', 'Destination'),
            dataType: 'TEXT',
            isRequired: false,
            ordinal: 2,
        },
    ];
    for (const f of fields) {
        await prisma.templateField.upsert({
            where: {
                templateId_fieldKey: { templateId: templateId(1), fieldKey: f.fieldKey },
            },
            update: {},
            create: {
                id: f.id,
                templateId: templateId(1),
                fieldKey: f.fieldKey,
                label: f.label,
                dataType: f.dataType,
                isRequired: f.isRequired,
                ordinal: f.ordinal,
            },
        });
    }
    const rules = [
        {
            id: eligibilityRuleId(1),
            attributeId: attributeId(1),
            operator: 'IN',
            value: ['EMPLOYEE', 'ADMIN'],
            description: t('الموظفون والإداريون', 'Employees and administrators'),
        },
        {
            id: eligibilityRuleId(2),
            attributeId: attributeId(4),
            operator: 'GTE',
            value: 2,
            description: t('مستوى التصريح 2 على الأقل', 'Clearance level 2 or higher'),
        },
    ];
    for (const r of rules) {
        await prisma.templateEligibilityRule.upsert({
            where: { id: r.id },
            update: { operator: r.operator, value: r.value },
            create: {
                id: r.id,
                templateId: templateId(1),
                attributeId: r.attributeId,
                operator: r.operator,
                value: r.value,
                description: r.description,
            },
        });
    }
    const URGENT_BY_DEFINITION = new Set(['MILITARY_DEFER', 'ID_REPLACEMENT']);
    const FEE_BY_TEMPLATE = {
        ID_REPLACEMENT: 5000,
        TRANSCRIPT: 3000,
        ENROLL_CERT: 2000,
    };
    const REQUIRED_BY_TEMPLATE = {
        ADMIN_LEAVE: ['leave_type', 'start_date', 'days_count'],
        CHANGE_MAJOR: ['target_major'],
        CONFERENCE: ['conference_name', 'start_date'],
        ENROLL_CERT: ['purpose', 'destination_entity'],
        GRADE_APPEAL: ['course_name', 'exam_type'],
        ID_REPLACEMENT: ['loss_date'],
        MILITARY_DEFER: ['recruitment_division', 'deferment_year'],
        NO_OBJECTION: ['destination_entity', 'purpose', 'travel_date'],
        PROVISIONAL_GRAD: ['graduation_year', 'destination_entity'],
        SALARY_CERT: ['destination_entity'],
        STUDY_WITHDRAWAL: ['from_semester', 'duration_semesters'],
        TRANSCRIPT: ['academic_year', 'semester'],
    };
    const catalogue = loadCatalogue();
    let fieldRow = 2;
    let ruleRow = 2;
    let stepRow = 0;
    for (const [index, tpl] of catalogue.entries()) {
        const id = templateId(index + 2);
        const isStudent = tpl.requesterType === 'STUDENT';
        const title = { ar: tpl.nameAr, en: tpl.nameEn };
        const description = { ar: tpl.descriptionAr };
        await prisma.template.upsert({
            where: { id },
            update: {
                code: tpl.code,
                title,
                description,
                classifierDocument: tpl.classifierDocument,
                defaultPriority: URGENT_BY_DEFINITION.has(tpl.code)
                    ? 'URGENT'
                    : 'NORMAL',
            },
            create: {
                id,
                code: tpl.code,
                categoryId: isStudent ? categoryId(2) : categoryId(1),
                sensitivityLevelId: sensitivityId(2),
                title,
                description,
                classifierDocument: tpl.classifierDocument,
                defaultPriority: URGENT_BY_DEFINITION.has(tpl.code)
                    ? 'URGENT'
                    : 'NORMAL',
                isActive: true,
            },
        });
        const required = new Set(REQUIRED_BY_TEMPLATE[tpl.code] ?? []);
        for (const [ordinal, field] of tpl.fields.entries()) {
            fieldRow += 1;
            const label = field.labelEn
                ? { ar: field.labelAr, en: field.labelEn }
                : { ar: field.labelAr };
            const stored = await prisma.templateField.upsert({
                where: { templateId_fieldKey: { templateId: id, fieldKey: field.key } },
                update: {
                    label,
                    dataType: field.type,
                    isRequired: required.has(field.key),
                    ordinal: ordinal + 1,
                    extractionQuestion: field.extractionQuestion,
                },
                create: {
                    id: templateFieldId(fieldRow),
                    templateId: id,
                    fieldKey: field.key,
                    label,
                    dataType: field.type,
                    isRequired: required.has(field.key),
                    ordinal: ordinal + 1,
                    extractionQuestion: field.extractionQuestion,
                },
            });
            for (const [optionOrdinal, option] of (field.options ?? []).entries()) {
                await prisma.templateFieldOption.upsert({
                    where: {
                        templateFieldId_value: {
                            templateFieldId: stored.id,
                            value: option.code,
                        },
                    },
                    update: { label: { ar: option.labelAr }, ordinal: optionOrdinal + 1 },
                    create: {
                        templateFieldId: stored.id,
                        value: option.code,
                        label: { ar: option.labelAr },
                        ordinal: optionOrdinal + 1,
                    },
                });
            }
        }
        ruleRow += 1;
        await prisma.templateEligibilityRule.upsert({
            where: { id: eligibilityRuleId(ruleRow) },
            update: {
                operator: 'IN',
                value: isStudent ? ['STUDENT', 'ADMIN'] : ['EMPLOYEE', 'ADMIN'],
            },
            create: {
                id: eligibilityRuleId(ruleRow),
                templateId: id,
                attributeId: attributeId(1),
                operator: 'IN',
                value: isStudent ? ['STUDENT', 'ADMIN'] : ['EMPLOYEE', 'ADMIN'],
                description: isStudent
                    ? t('الطلاب والإداريون', 'Students and administrators')
                    : t('الموظفون والإداريون', 'Employees and administrators'),
            },
        });
        const pathId = workflowPathId(index + 1);
        await prisma.workflowPath.upsert({
            where: { id: pathId },
            update: {},
            create: {
                id: pathId,
                templateId: id,
                name: isStudent
                    ? t('مسار طلبات الطلاب', 'Student track')
                    : t('مسار طلبات الموظفين', 'Employee track'),
                isActive: true,
            },
        });
        const fee = FEE_BY_TEMPLATE[tpl.code];
        const steps = isStudent
            ? [
                {
                    name: t('تدقيق شؤون الطلاب', 'Student affairs review'),
                    roleId: roleId(2),
                    slaHours: 24,
                    feeAmount: fee,
                    actions: [actionTypeId(1), actionTypeId(2), actionTypeId(4)],
                },
                {
                    name: t('الاعتماد', 'Approval'),
                    roleId: roleId(1),
                    slaHours: 48,
                    feeAmount: undefined,
                    actions: [actionTypeId(1), actionTypeId(2), actionTypeId(5)],
                },
            ]
            : [
                {
                    name: t('تدقيق الموارد البشرية', 'HR review'),
                    roleId: roleId(2),
                    slaHours: 24,
                    feeAmount: fee,
                    actions: [actionTypeId(1), actionTypeId(2), actionTypeId(4)],
                },
                {
                    name: t('اعتماد الإدارة', 'Management approval'),
                    roleId: roleId(1),
                    slaHours: 72,
                    feeAmount: undefined,
                    actions: [actionTypeId(1), actionTypeId(2), actionTypeId(5)],
                },
            ];
        let previousStepId;
        for (const step of steps) {
            stepRow += 1;
            const stepId = workflowStepId(stepRow);
            await prisma.workflowStep.upsert({
                where: { id: stepId },
                update: {
                    feeAmount: step.feeAmount ?? null,
                    feeCurrency: step.feeAmount ? 'SYP' : null,
                },
                create: {
                    id: stepId,
                    workflowPathId: pathId,
                    name: step.name,
                    assigneeType: 'SPECIFIC_ROLE',
                    assigneeRoleId: step.roleId,
                    slaHours: step.slaHours,
                    pausesSla: false,
                    feeAmount: step.feeAmount ?? null,
                    feeCurrency: step.feeAmount ? 'SYP' : null,
                },
            });
            for (const allowed of step.actions) {
                await prisma.workflowStepAllowedAction.upsert({
                    where: {
                        workflowStepId_actionTypeId: {
                            workflowStepId: stepId,
                            actionTypeId: allowed,
                        },
                    },
                    update: {},
                    create: { workflowStepId: stepId, actionTypeId: allowed },
                });
            }
            if (previousStepId)
                await prisma.workflowStepDependency.upsert({
                    where: {
                        workflowStepId_dependsOnStepId: {
                            workflowStepId: stepId,
                            dependsOnStepId: previousStepId,
                        },
                    },
                    update: {},
                    create: { workflowStepId: stepId, dependsOnStepId: previousStepId },
                });
            previousStepId = stepId;
        }
    }
    const everyone = await prisma.user.findMany({
        select: { id: true, userType: true },
    });
    for (const person of everyone) {
        await prisma.userAttribute.upsert({
            where: {
                userId_attributeId: {
                    userId: person.id,
                    attributeId: attributeId(1),
                },
            },
            update: {},
            create: {
                userId: person.id,
                attributeId: attributeId(1),
                value: person.userType,
            },
        });
    }
    console.log(`  Catalogue    : ${catalogue.length} templates, ${fieldRow - 2} fields, ` +
        `${stepRow} workflow steps`);
    console.log(`  user_type    : backfilled for ${everyone.length} accounts`);
    console.log('Seed complete.');
    console.log('  Admin login  : admin@correspondence.local / Admin@12345');
    console.log('  Reviewer 1   : reviewer1@correspondence.local / Review@12345');
    console.log('  Reviewer 2   : reviewer2@correspondence.local / Review@12345');
    console.log('  AI service   : ai-service@correspondence.local / change-me');
    console.log('');
    console.log('  Seeded ids (stable across resets):');
    console.log(`    SYSTEM account : ${system_actor_1.SYSTEM_USER_ID}`);
    console.log(`    admin user     : ${userId(1)}`);
    console.log(`    reviewer 1     : ${userId(2)}`);
    console.log(`    reviewer 2     : ${userId(3)}`);
    console.log(`    Reviewer role  : ${roleId(2)}`);
    console.log(`    demo template  : ${templateId(1)}`);
    console.log(`    AI service user: ${userId(4)}`);
    console.log(`    first catalogue template: ${templateId(2)}`);
    console.log(`    action APPROVE : ${actionTypeId(1)}`);
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=seed.js.map