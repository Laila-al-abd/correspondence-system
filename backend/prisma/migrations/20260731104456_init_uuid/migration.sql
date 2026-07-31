/*
  Warnings:

  - The primary key for the `academic_calendar` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `created_by` column on the `academic_calendar` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `academic_calendar` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `action_types` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `created_by` column on the `action_types` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `action_types` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `attribute_definitions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `created_by` column on the `attribute_definitions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `attribute_definitions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `delegations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `created_by` column on the `delegations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `delegations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `departments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `parent_id` column on the `departments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `created_by` column on the `departments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `departments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `documents` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `request_action_id` column on the `documents` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `event_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `request_id` column on the `event_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `request_step_instance_id` column on the `event_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `actor_id` column on the `event_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `action_type_id` column on the `event_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `created_by` column on the `languages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `languages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ml_predictions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `created_by` column on the `ml_predictions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `request_id` column on the `notifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `created_by` column on the `notifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `notifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `org_unit_types` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `created_by` column on the `org_unit_types` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `org_unit_types` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `payments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `request_step_instance_id` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `requested_by` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `confirmed_by` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `created_by` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `permission_groups` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `created_by` column on the `permission_groups` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `permission_groups` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `created_by` column on the `permissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `permissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `request_actions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `request_step_instance_id` column on the `request_actions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `created_by` column on the `request_actions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `request_categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `created_by` column on the `request_categories` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `request_categories` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `request_number_sequences` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `request_step_instances` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `assigned_to_user_id` column on the `request_step_instances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `created_by` column on the `request_step_instances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `request_step_instances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `requests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `template_id` column on the `requests` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `workflow_path_id` column on the `requests` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `sensitivity_level_id` column on the `requests` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `created_by` column on the `requests` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `requests` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `role_permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `created_by` column on the `role_permissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `created_by` column on the `roles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `roles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `sensitivity_levels` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `created_by` column on the `sensitivity_levels` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `sensitivity_levels` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `system_settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `updated_by` column on the `system_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `created_by` column on the `system_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `template_eligibility_rules` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `created_by` column on the `template_eligibility_rules` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `template_eligibility_rules` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `template_field_options` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `created_by` column on the `template_field_options` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `template_field_options` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `template_fields` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `created_by` column on the `template_fields` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `template_fields` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `templates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `created_by` column on the `templates` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `templates` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `user_attributes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `created_by` column on the `user_attributes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `user_attributes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `user_roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `department_id` column on the `user_roles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `assigned_by` column on the `user_roles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `department_id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `created_by` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `workflow_paths` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `created_by` column on the `workflow_paths` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `workflow_paths` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `workflow_step_allowed_actions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `created_by` column on the `workflow_step_allowed_actions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `workflow_step_dependencies` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `created_by` column on the `workflow_step_dependencies` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `workflow_steps` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `assignee_role_id` column on the `workflow_steps` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `assignee_department_id` column on the `workflow_steps` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `default_action_type_id` column on the `workflow_steps` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `created_by` column on the `workflow_steps` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `workflow_steps` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `id` on the `academic_calendar` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `action_types` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `attribute_definitions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `delegations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `delegator_id` on the `delegations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `delegate_id` on the `delegations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `departments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `unit_type_id` on the `departments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `documents` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `request_id` on the `documents` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uploader_id` on the `documents` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `event_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `ml_predictions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `request_id` on the `ml_predictions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `org_unit_types` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `payments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `request_id` on the `payments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `permission_groups` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `permissions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `group_id` on the `permissions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `request_actions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `request_id` on the `request_actions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `actor_id` on the `request_actions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `action_type_id` on the `request_actions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `request_categories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `request_step_instances` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `request_id` on the `request_step_instances` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workflow_step_id` on the `request_step_instances` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `requests` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `requester_id` on the `requests` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `role_permissions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role_id` on the `role_permissions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `permission_id` on the `role_permissions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `roles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `sensitivity_levels` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `system_settings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `template_eligibility_rules` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `template_id` on the `template_eligibility_rules` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `attribute_id` on the `template_eligibility_rules` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `template_field_options` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `template_field_id` on the `template_field_options` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `template_fields` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `template_id` on the `template_fields` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `templates` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `category_id` on the `templates` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `sensitivity_level_id` on the `templates` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `user_attributes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `user_attributes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `attribute_id` on the `user_attributes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `user_roles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `user_roles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role_id` on the `user_roles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `workflow_paths` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `template_id` on the `workflow_paths` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `workflow_step_allowed_actions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workflow_step_id` on the `workflow_step_allowed_actions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `action_type_id` on the `workflow_step_allowed_actions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `workflow_step_dependencies` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workflow_step_id` on the `workflow_step_dependencies` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `depends_on_step_id` on the `workflow_step_dependencies` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `workflow_steps` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workflow_path_id` on the `workflow_steps` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "delegations" DROP CONSTRAINT "delegations_delegate_id_fkey";

-- DropForeignKey
ALTER TABLE "delegations" DROP CONSTRAINT "delegations_delegator_id_fkey";

-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_unit_type_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_request_action_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_request_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_uploader_id_fkey";

-- DropForeignKey
ALTER TABLE "event_logs" DROP CONSTRAINT "event_logs_action_type_id_fkey";

-- DropForeignKey
ALTER TABLE "event_logs" DROP CONSTRAINT "event_logs_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "event_logs" DROP CONSTRAINT "event_logs_request_id_fkey";

-- DropForeignKey
ALTER TABLE "event_logs" DROP CONSTRAINT "event_logs_request_step_instance_id_fkey";

-- DropForeignKey
ALTER TABLE "ml_predictions" DROP CONSTRAINT "ml_predictions_request_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_request_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_confirmed_by_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_request_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_request_step_instance_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_requested_by_fkey";

-- DropForeignKey
ALTER TABLE "permissions" DROP CONSTRAINT "permissions_group_id_fkey";

-- DropForeignKey
ALTER TABLE "request_actions" DROP CONSTRAINT "request_actions_action_type_id_fkey";

-- DropForeignKey
ALTER TABLE "request_actions" DROP CONSTRAINT "request_actions_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "request_actions" DROP CONSTRAINT "request_actions_request_id_fkey";

-- DropForeignKey
ALTER TABLE "request_actions" DROP CONSTRAINT "request_actions_request_step_instance_id_fkey";

-- DropForeignKey
ALTER TABLE "request_step_instances" DROP CONSTRAINT "request_step_instances_assigned_to_user_id_fkey";

-- DropForeignKey
ALTER TABLE "request_step_instances" DROP CONSTRAINT "request_step_instances_request_id_fkey";

-- DropForeignKey
ALTER TABLE "request_step_instances" DROP CONSTRAINT "request_step_instances_workflow_step_id_fkey";

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_requester_id_fkey";

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_sensitivity_level_id_fkey";

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_template_id_fkey";

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_workflow_path_id_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_role_id_fkey";

-- DropForeignKey
ALTER TABLE "system_settings" DROP CONSTRAINT "system_settings_updated_by_fkey";

-- DropForeignKey
ALTER TABLE "template_eligibility_rules" DROP CONSTRAINT "template_eligibility_rules_attribute_id_fkey";

-- DropForeignKey
ALTER TABLE "template_eligibility_rules" DROP CONSTRAINT "template_eligibility_rules_template_id_fkey";

-- DropForeignKey
ALTER TABLE "template_field_options" DROP CONSTRAINT "template_field_options_template_field_id_fkey";

-- DropForeignKey
ALTER TABLE "template_fields" DROP CONSTRAINT "template_fields_template_id_fkey";

-- DropForeignKey
ALTER TABLE "templates" DROP CONSTRAINT "templates_category_id_fkey";

-- DropForeignKey
ALTER TABLE "templates" DROP CONSTRAINT "templates_sensitivity_level_id_fkey";

-- DropForeignKey
ALTER TABLE "user_attributes" DROP CONSTRAINT "user_attributes_attribute_id_fkey";

-- DropForeignKey
ALTER TABLE "user_attributes" DROP CONSTRAINT "user_attributes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_assigned_by_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_department_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_role_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_department_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow_paths" DROP CONSTRAINT "workflow_paths_template_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow_step_allowed_actions" DROP CONSTRAINT "workflow_step_allowed_actions_action_type_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow_step_allowed_actions" DROP CONSTRAINT "workflow_step_allowed_actions_workflow_step_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow_step_dependencies" DROP CONSTRAINT "workflow_step_dependencies_depends_on_step_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow_step_dependencies" DROP CONSTRAINT "workflow_step_dependencies_workflow_step_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow_steps" DROP CONSTRAINT "workflow_steps_assignee_department_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow_steps" DROP CONSTRAINT "workflow_steps_assignee_role_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow_steps" DROP CONSTRAINT "workflow_steps_default_action_type_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow_steps" DROP CONSTRAINT "workflow_steps_workflow_path_id_fkey";

-- AlterTable
ALTER TABLE "academic_calendar" DROP CONSTRAINT "academic_calendar_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "academic_calendar_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "action_types" DROP CONSTRAINT "action_types_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "action_types_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "attribute_definitions" DROP CONSTRAINT "attribute_definitions_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "attribute_definitions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "delegations" DROP CONSTRAINT "delegations_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "delegator_id",
ADD COLUMN     "delegator_id" UUID NOT NULL,
DROP COLUMN "delegate_id",
ADD COLUMN     "delegate_id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "delegations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "departments" DROP CONSTRAINT "departments_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "parent_id",
ADD COLUMN     "parent_id" UUID,
DROP COLUMN "unit_type_id",
ADD COLUMN     "unit_type_id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "departments_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "documents" DROP CONSTRAINT "documents_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "request_id",
ADD COLUMN     "request_id" UUID NOT NULL,
DROP COLUMN "request_action_id",
ADD COLUMN     "request_action_id" UUID,
DROP COLUMN "uploader_id",
ADD COLUMN     "uploader_id" UUID NOT NULL,
ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "event_logs" DROP CONSTRAINT "event_logs_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "request_id",
ADD COLUMN     "request_id" UUID,
DROP COLUMN "request_step_instance_id",
ADD COLUMN     "request_step_instance_id" UUID,
DROP COLUMN "actor_id",
ADD COLUMN     "actor_id" UUID,
DROP COLUMN "action_type_id",
ADD COLUMN     "action_type_id" UUID,
ADD CONSTRAINT "event_logs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "languages" DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID;

-- AlterTable
ALTER TABLE "ml_predictions" DROP CONSTRAINT "ml_predictions_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "request_id",
ADD COLUMN     "request_id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
ADD CONSTRAINT "ml_predictions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
DROP COLUMN "request_id",
ADD COLUMN     "request_id" UUID,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "org_unit_types" DROP CONSTRAINT "org_unit_types_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "org_unit_types_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "payments" DROP CONSTRAINT "payments_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "request_id",
ADD COLUMN     "request_id" UUID NOT NULL,
DROP COLUMN "request_step_instance_id",
ADD COLUMN     "request_step_instance_id" UUID,
DROP COLUMN "requested_by",
ADD COLUMN     "requested_by" UUID,
DROP COLUMN "confirmed_by",
ADD COLUMN     "confirmed_by" UUID,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "permission_groups" DROP CONSTRAINT "permission_groups_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "permission_groups_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "permissions" DROP CONSTRAINT "permissions_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "group_id",
ADD COLUMN     "group_id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "request_actions" DROP CONSTRAINT "request_actions_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "request_id",
ADD COLUMN     "request_id" UUID NOT NULL,
DROP COLUMN "request_step_instance_id",
ADD COLUMN     "request_step_instance_id" UUID,
DROP COLUMN "actor_id",
ADD COLUMN     "actor_id" UUID NOT NULL,
DROP COLUMN "action_type_id",
ADD COLUMN     "action_type_id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
ADD CONSTRAINT "request_actions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "request_categories" DROP CONSTRAINT "request_categories_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "request_categories_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "request_number_sequences" DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID;

-- AlterTable
ALTER TABLE "request_step_instances" DROP CONSTRAINT "request_step_instances_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "request_id",
ADD COLUMN     "request_id" UUID NOT NULL,
DROP COLUMN "workflow_step_id",
ADD COLUMN     "workflow_step_id" UUID NOT NULL,
DROP COLUMN "assigned_to_user_id",
ADD COLUMN     "assigned_to_user_id" UUID,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "request_step_instances_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "requests" DROP CONSTRAINT "requests_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "requester_id",
ADD COLUMN     "requester_id" UUID NOT NULL,
DROP COLUMN "template_id",
ADD COLUMN     "template_id" UUID,
DROP COLUMN "workflow_path_id",
ADD COLUMN     "workflow_path_id" UUID,
DROP COLUMN "sensitivity_level_id",
ADD COLUMN     "sensitivity_level_id" UUID,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "requests_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "role_id",
ADD COLUMN     "role_id" UUID NOT NULL,
DROP COLUMN "permission_id",
ADD COLUMN     "permission_id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "roles" DROP CONSTRAINT "roles_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "sensitivity_levels" DROP CONSTRAINT "sensitivity_levels_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "sensitivity_levels_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "system_settings" DROP CONSTRAINT "system_settings_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
ADD CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "template_eligibility_rules" DROP CONSTRAINT "template_eligibility_rules_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "template_id",
ADD COLUMN     "template_id" UUID NOT NULL,
DROP COLUMN "attribute_id",
ADD COLUMN     "attribute_id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "template_eligibility_rules_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "template_field_options" DROP CONSTRAINT "template_field_options_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "template_field_id",
ADD COLUMN     "template_field_id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "template_field_options_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "template_fields" DROP CONSTRAINT "template_fields_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "template_id",
ADD COLUMN     "template_id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "template_fields_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "templates" DROP CONSTRAINT "templates_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "category_id",
ADD COLUMN     "category_id" UUID NOT NULL,
DROP COLUMN "sensitivity_level_id",
ADD COLUMN     "sensitivity_level_id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "templates_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user_attributes" DROP CONSTRAINT "user_attributes_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
DROP COLUMN "attribute_id",
ADD COLUMN     "attribute_id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "user_attributes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
DROP COLUMN "role_id",
ADD COLUMN     "role_id" UUID NOT NULL,
DROP COLUMN "department_id",
ADD COLUMN     "department_id" UUID,
DROP COLUMN "assigned_by",
ADD COLUMN     "assigned_by" UUID,
ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "department_id",
ADD COLUMN     "department_id" UUID,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "workflow_paths" DROP CONSTRAINT "workflow_paths_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "template_id",
ADD COLUMN     "template_id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "workflow_paths_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "workflow_step_allowed_actions" DROP CONSTRAINT "workflow_step_allowed_actions_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "workflow_step_id",
ADD COLUMN     "workflow_step_id" UUID NOT NULL,
DROP COLUMN "action_type_id",
ADD COLUMN     "action_type_id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
ADD CONSTRAINT "workflow_step_allowed_actions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "workflow_step_dependencies" DROP CONSTRAINT "workflow_step_dependencies_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "workflow_step_id",
ADD COLUMN     "workflow_step_id" UUID NOT NULL,
DROP COLUMN "depends_on_step_id",
ADD COLUMN     "depends_on_step_id" UUID NOT NULL,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
ADD CONSTRAINT "workflow_step_dependencies_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "workflow_steps" DROP CONSTRAINT "workflow_steps_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "workflow_path_id",
ADD COLUMN     "workflow_path_id" UUID NOT NULL,
DROP COLUMN "assignee_role_id",
ADD COLUMN     "assignee_role_id" UUID,
DROP COLUMN "assignee_department_id",
ADD COLUMN     "assignee_department_id" UUID,
DROP COLUMN "default_action_type_id",
ADD COLUMN     "default_action_type_id" UUID,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
ADD CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "delegations_delegator_id_idx" ON "delegations"("delegator_id");

-- CreateIndex
CREATE INDEX "delegations_delegate_id_idx" ON "delegations"("delegate_id");

-- CreateIndex
CREATE INDEX "departments_parent_id_idx" ON "departments"("parent_id");

-- CreateIndex
CREATE INDEX "departments_unit_type_id_idx" ON "departments"("unit_type_id");

-- CreateIndex
CREATE INDEX "documents_request_id_idx" ON "documents"("request_id");

-- CreateIndex
CREATE INDEX "documents_request_action_id_idx" ON "documents"("request_action_id");

-- CreateIndex
CREATE INDEX "event_logs_request_id_idx" ON "event_logs"("request_id");

-- CreateIndex
CREATE INDEX "ml_predictions_request_id_idx" ON "ml_predictions"("request_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_request_id_idx" ON "notifications"("request_id");

-- CreateIndex
CREATE INDEX "payments_request_id_idx" ON "payments"("request_id");

-- CreateIndex
CREATE INDEX "permissions_group_id_idx" ON "permissions"("group_id");

-- CreateIndex
CREATE INDEX "request_actions_request_id_idx" ON "request_actions"("request_id");

-- CreateIndex
CREATE INDEX "request_actions_request_step_instance_id_idx" ON "request_actions"("request_step_instance_id");

-- CreateIndex
CREATE INDEX "request_actions_actor_id_idx" ON "request_actions"("actor_id");

-- CreateIndex
CREATE INDEX "request_step_instances_request_id_idx" ON "request_step_instances"("request_id");

-- CreateIndex
CREATE INDEX "request_step_instances_assigned_to_user_id_idx" ON "request_step_instances"("assigned_to_user_id");

-- CreateIndex
CREATE INDEX "requests_requester_id_idx" ON "requests"("requester_id");

-- CreateIndex
CREATE INDEX "requests_template_id_idx" ON "requests"("template_id");

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE INDEX "system_settings_updated_by_idx" ON "system_settings"("updated_by");

-- CreateIndex
CREATE INDEX "template_eligibility_rules_template_id_idx" ON "template_eligibility_rules"("template_id");

-- CreateIndex
CREATE INDEX "template_eligibility_rules_attribute_id_idx" ON "template_eligibility_rules"("attribute_id");

-- CreateIndex
CREATE INDEX "template_field_options_template_field_id_idx" ON "template_field_options"("template_field_id");

-- CreateIndex
CREATE UNIQUE INDEX "template_field_options_template_field_id_value_key" ON "template_field_options"("template_field_id", "value");

-- CreateIndex
CREATE UNIQUE INDEX "template_fields_template_id_field_key_key" ON "template_fields"("template_id", "field_key");

-- CreateIndex
CREATE INDEX "templates_category_id_idx" ON "templates"("category_id");

-- CreateIndex
CREATE INDEX "templates_sensitivity_level_id_idx" ON "templates"("sensitivity_level_id");

-- CreateIndex
CREATE INDEX "user_attributes_attribute_id_idx" ON "user_attributes"("attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_attributes_user_id_attribute_id_key" ON "user_attributes"("user_id", "attribute_id");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE INDEX "user_roles_department_id_idx" ON "user_roles"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_department_id_assigned_at_key" ON "user_roles"("user_id", "role_id", "department_id", "assigned_at");

-- CreateIndex
CREATE INDEX "users_department_id_idx" ON "users"("department_id");

-- CreateIndex
CREATE INDEX "workflow_paths_template_id_idx" ON "workflow_paths"("template_id");

-- CreateIndex
CREATE INDEX "workflow_step_allowed_actions_action_type_id_idx" ON "workflow_step_allowed_actions"("action_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_step_allowed_actions_workflow_step_id_action_type__key" ON "workflow_step_allowed_actions"("workflow_step_id", "action_type_id");

-- CreateIndex
CREATE INDEX "workflow_step_dependencies_depends_on_step_id_idx" ON "workflow_step_dependencies"("depends_on_step_id");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_step_dependencies_workflow_step_id_depends_on_step_key" ON "workflow_step_dependencies"("workflow_step_id", "depends_on_step_id");

-- CreateIndex
CREATE INDEX "workflow_steps_workflow_path_id_idx" ON "workflow_steps"("workflow_path_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_attributes" ADD CONSTRAINT "user_attributes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_attributes" ADD CONSTRAINT "user_attributes_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attribute_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "permission_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delegations" ADD CONSTRAINT "delegations_delegator_id_fkey" FOREIGN KEY ("delegator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delegations" ADD CONSTRAINT "delegations_delegate_id_fkey" FOREIGN KEY ("delegate_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_unit_type_id_fkey" FOREIGN KEY ("unit_type_id") REFERENCES "org_unit_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "request_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_sensitivity_level_id_fkey" FOREIGN KEY ("sensitivity_level_id") REFERENCES "sensitivity_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_fields" ADD CONSTRAINT "template_fields_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_field_options" ADD CONSTRAINT "template_field_options_template_field_id_fkey" FOREIGN KEY ("template_field_id") REFERENCES "template_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_eligibility_rules" ADD CONSTRAINT "template_eligibility_rules_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_eligibility_rules" ADD CONSTRAINT "template_eligibility_rules_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attribute_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_paths" ADD CONSTRAINT "workflow_paths_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_workflow_path_id_fkey" FOREIGN KEY ("workflow_path_id") REFERENCES "workflow_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_assignee_role_id_fkey" FOREIGN KEY ("assignee_role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_assignee_department_id_fkey" FOREIGN KEY ("assignee_department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_default_action_type_id_fkey" FOREIGN KEY ("default_action_type_id") REFERENCES "action_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_step_allowed_actions" ADD CONSTRAINT "workflow_step_allowed_actions_workflow_step_id_fkey" FOREIGN KEY ("workflow_step_id") REFERENCES "workflow_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_step_allowed_actions" ADD CONSTRAINT "workflow_step_allowed_actions_action_type_id_fkey" FOREIGN KEY ("action_type_id") REFERENCES "action_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_step_dependencies" ADD CONSTRAINT "workflow_step_dependencies_workflow_step_id_fkey" FOREIGN KEY ("workflow_step_id") REFERENCES "workflow_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_step_dependencies" ADD CONSTRAINT "workflow_step_dependencies_depends_on_step_id_fkey" FOREIGN KEY ("depends_on_step_id") REFERENCES "workflow_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_workflow_path_id_fkey" FOREIGN KEY ("workflow_path_id") REFERENCES "workflow_paths"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_sensitivity_level_id_fkey" FOREIGN KEY ("sensitivity_level_id") REFERENCES "sensitivity_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_step_instances" ADD CONSTRAINT "request_step_instances_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_step_instances" ADD CONSTRAINT "request_step_instances_workflow_step_id_fkey" FOREIGN KEY ("workflow_step_id") REFERENCES "workflow_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_step_instances" ADD CONSTRAINT "request_step_instances_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_actions" ADD CONSTRAINT "request_actions_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_actions" ADD CONSTRAINT "request_actions_request_step_instance_id_fkey" FOREIGN KEY ("request_step_instance_id") REFERENCES "request_step_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_actions" ADD CONSTRAINT "request_actions_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_actions" ADD CONSTRAINT "request_actions_action_type_id_fkey" FOREIGN KEY ("action_type_id") REFERENCES "action_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_request_step_instance_id_fkey" FOREIGN KEY ("request_step_instance_id") REFERENCES "request_step_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_request_action_id_fkey" FOREIGN KEY ("request_action_id") REFERENCES "request_actions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_logs" ADD CONSTRAINT "event_logs_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_logs" ADD CONSTRAINT "event_logs_request_step_instance_id_fkey" FOREIGN KEY ("request_step_instance_id") REFERENCES "request_step_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_logs" ADD CONSTRAINT "event_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_logs" ADD CONSTRAINT "event_logs_action_type_id_fkey" FOREIGN KEY ("action_type_id") REFERENCES "action_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ml_predictions" ADD CONSTRAINT "ml_predictions_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
