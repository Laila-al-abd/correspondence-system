/*
  Warnings:

  - Added the required column `updated_at` to the `academic_calendar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `action_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `attribute_definitions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `delegations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `departments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `languages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `org_unit_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `permission_groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `request_categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `request_step_instances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `sensitivity_levels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `template_eligibility_rules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `template_fields` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `user_attributes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `workflow_paths` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `workflow_steps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "academic_calendar" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "action_types" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "attribute_definitions" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "delegations" ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "languages" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "org_unit_types" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "permission_groups" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "request_categories" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "request_step_instances" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "requests" ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "role_permissions" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "sensitivity_levels" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "system_settings" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "template_eligibility_rules" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "template_fields" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "templates" ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "user_attributes" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "workflow_paths" ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "workflow_step_allowed_actions" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "workflow_step_dependencies" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "workflow_steps" ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;
