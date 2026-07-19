-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "user_type" VARCHAR(30) NOT NULL,
    "full_name_ar" VARCHAR(200) NOT NULL,
    "full_name_en" VARCHAR(200),
    "institutional_number" VARCHAR(50),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(30),
    "password_hash" VARCHAR(255),
    "auth_provider" VARCHAR(30) NOT NULL DEFAULT 'LOCAL',
    "applicant_purpose" VARCHAR(50),
    "department_id" BIGINT,
    "preferred_lang" VARCHAR(10) NOT NULL DEFAULT 'ar',
    "signature_key" VARCHAR(255),
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_synced_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_definitions" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "label" JSONB NOT NULL,
    "data_type" VARCHAR(20) NOT NULL,
    "description" JSONB,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "attribute_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_attributes" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "attribute_id" BIGINT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "user_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" BIGSERIAL NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_groups" (
    "id" BIGSERIAL NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,

    CONSTRAINT "permission_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" BIGSERIAL NOT NULL,
    "group_id" BIGINT NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" BIGSERIAL NOT NULL,
    "role_id" BIGINT NOT NULL,
    "permission_id" BIGINT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "role_id" BIGINT NOT NULL,
    "department_id" BIGINT,
    "reason" TEXT,
    "expires_at" TIMESTAMPTZ(6),
    "assigned_by" BIGINT,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delegations" (
    "id" BIGSERIAL NOT NULL,
    "delegator_id" BIGINT NOT NULL,
    "delegate_id" BIGINT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "reason" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "delegations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_unit_types" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "org_unit_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" BIGSERIAL NOT NULL,
    "parent_id" BIGINT,
    "unit_type_id" BIGINT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "external_id" VARCHAR(100),
    "source_system" VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
    "last_synced_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensitivity_levels" (
    "id" BIGSERIAL NOT NULL,
    "name" JSONB NOT NULL,
    "rank" INTEGER NOT NULL,
    "description" JSONB,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "sensitivity_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_categories" (
    "id" BIGSERIAL NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "request_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" BIGSERIAL NOT NULL,
    "category_id" BIGINT NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB,
    "sensitivity_level_id" BIGINT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_fields" (
    "id" BIGSERIAL NOT NULL,
    "template_id" BIGINT NOT NULL,
    "field_key" VARCHAR(100) NOT NULL,
    "label" JSONB NOT NULL,
    "data_type" VARCHAR(20) NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "ordinal" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "template_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_eligibility_rules" (
    "id" BIGSERIAL NOT NULL,
    "template_id" BIGINT NOT NULL,
    "attribute_id" BIGINT NOT NULL,
    "operator" VARCHAR(10) NOT NULL,
    "value" JSONB NOT NULL,
    "description" JSONB,

    CONSTRAINT "template_eligibility_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_types" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" JSONB NOT NULL,
    "is_terminal" BOOLEAN NOT NULL DEFAULT false,
    "description" JSONB,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "action_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_paths" (
    "id" BIGSERIAL NOT NULL,
    "template_id" BIGINT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "workflow_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_steps" (
    "id" BIGSERIAL NOT NULL,
    "workflow_path_id" BIGINT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "assignee_type" VARCHAR(50) NOT NULL,
    "assignee_role_id" BIGINT,
    "assignee_department_id" BIGINT,
    "default_action_type_id" BIGINT,
    "sla_hours" DECIMAL(6,2),
    "pauses_sla" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_step_allowed_actions" (
    "id" BIGSERIAL NOT NULL,
    "workflow_step_id" BIGINT NOT NULL,
    "action_type_id" BIGINT NOT NULL,

    CONSTRAINT "workflow_step_allowed_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_step_dependencies" (
    "id" BIGSERIAL NOT NULL,
    "workflow_step_id" BIGINT NOT NULL,
    "depends_on_step_id" BIGINT NOT NULL,

    CONSTRAINT "workflow_step_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" BIGSERIAL NOT NULL,
    "requester_id" BIGINT NOT NULL,
    "raw_text" TEXT,
    "template_id" BIGINT,
    "workflow_path_id" BIGINT,
    "filled_data" JSONB,
    "classification_status" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    "classification_confidence" DECIMAL(5,4),
    "classified_by" VARCHAR(30),
    "current_status" VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    "priority" VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    "sensitivity_level_id" BIGINT,
    "sla_due_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_step_instances" (
    "id" BIGSERIAL NOT NULL,
    "request_id" BIGINT NOT NULL,
    "workflow_step_id" BIGINT NOT NULL,
    "assigned_to_user_id" BIGINT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    "sla_due_at" TIMESTAMPTZ(6),
    "sla_paused" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "request_step_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_actions" (
    "id" BIGSERIAL NOT NULL,
    "request_id" BIGINT NOT NULL,
    "request_step_instance_id" BIGINT,
    "actor_id" BIGINT NOT NULL,
    "action_type_id" BIGINT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" BIGSERIAL NOT NULL,
    "request_id" BIGINT NOT NULL,
    "request_step_instance_id" BIGINT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'SYP',
    "status" VARCHAR(30) NOT NULL DEFAULT 'REQUIRED',
    "requested_by" BIGINT,
    "confirmed_by" BIGINT,
    "requested_at" TIMESTAMPTZ(6),
    "confirmed_at" TIMESTAMPTZ(6),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" BIGSERIAL NOT NULL,
    "request_id" BIGINT NOT NULL,
    "request_action_id" BIGINT,
    "uploader_id" BIGINT NOT NULL,
    "doc_kind" VARCHAR(50) NOT NULL,
    "storage_key" VARCHAR(500) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "file_size" BIGINT NOT NULL,
    "ocr_text" TEXT,
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_calendar" (
    "id" BIGSERIAL NOT NULL,
    "name" JSONB NOT NULL,
    "period_type" VARCHAR(30) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "description" JSONB,

    CONSTRAINT "academic_calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_logs" (
    "id" BIGSERIAL NOT NULL,
    "request_id" BIGINT,
    "request_step_instance_id" BIGINT,
    "actor_id" BIGINT,
    "action_type_id" BIGINT,
    "event_type" VARCHAR(50) NOT NULL,
    "from_status" VARCHAR(30),
    "to_status" VARCHAR(30),
    "ip_address" INET,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "request_id" BIGINT,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ml_predictions" (
    "id" BIGSERIAL NOT NULL,
    "request_id" BIGINT NOT NULL,
    "model_type" VARCHAR(50) NOT NULL,
    "model_version" VARCHAR(50) NOT NULL,
    "predicted_value" JSONB NOT NULL,
    "confidence" DECIMAL(5,4),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ml_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" BIGSERIAL NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" BIGINT,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_institutional_number_key" ON "users"("institutional_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_department_id_idx" ON "users"("department_id");

-- CreateIndex
CREATE INDEX "users_preferred_lang_idx" ON "users"("preferred_lang");

-- CreateIndex
CREATE UNIQUE INDEX "attribute_definitions_code_key" ON "attribute_definitions"("code");

-- CreateIndex
CREATE INDEX "user_attributes_attribute_id_idx" ON "user_attributes"("attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_attributes_user_id_attribute_id_key" ON "user_attributes"("user_id", "attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "permissions_group_id_idx" ON "permissions"("group_id");

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE INDEX "user_roles_department_id_idx" ON "user_roles"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_department_id_assigned_at_key" ON "user_roles"("user_id", "role_id", "department_id", "assigned_at");

-- CreateIndex
CREATE INDEX "delegations_delegator_id_idx" ON "delegations"("delegator_id");

-- CreateIndex
CREATE INDEX "delegations_delegate_id_idx" ON "delegations"("delegate_id");

-- CreateIndex
CREATE UNIQUE INDEX "org_unit_types_code_key" ON "org_unit_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "departments_external_id_key" ON "departments"("external_id");

-- CreateIndex
CREATE INDEX "departments_parent_id_idx" ON "departments"("parent_id");

-- CreateIndex
CREATE INDEX "departments_unit_type_id_idx" ON "departments"("unit_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "sensitivity_levels_rank_key" ON "sensitivity_levels"("rank");

-- CreateIndex
CREATE INDEX "templates_category_id_idx" ON "templates"("category_id");

-- CreateIndex
CREATE INDEX "templates_sensitivity_level_id_idx" ON "templates"("sensitivity_level_id");

-- CreateIndex
CREATE UNIQUE INDEX "template_fields_template_id_field_key_key" ON "template_fields"("template_id", "field_key");

-- CreateIndex
CREATE INDEX "template_eligibility_rules_template_id_idx" ON "template_eligibility_rules"("template_id");

-- CreateIndex
CREATE INDEX "template_eligibility_rules_attribute_id_idx" ON "template_eligibility_rules"("attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "action_types_code_key" ON "action_types"("code");

-- CreateIndex
CREATE INDEX "workflow_paths_template_id_idx" ON "workflow_paths"("template_id");

-- CreateIndex
CREATE INDEX "workflow_steps_workflow_path_id_idx" ON "workflow_steps"("workflow_path_id");

-- CreateIndex
CREATE INDEX "workflow_step_allowed_actions_action_type_id_idx" ON "workflow_step_allowed_actions"("action_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_step_allowed_actions_workflow_step_id_action_type__key" ON "workflow_step_allowed_actions"("workflow_step_id", "action_type_id");

-- CreateIndex
CREATE INDEX "workflow_step_dependencies_depends_on_step_id_idx" ON "workflow_step_dependencies"("depends_on_step_id");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_step_dependencies_workflow_step_id_depends_on_step_key" ON "workflow_step_dependencies"("workflow_step_id", "depends_on_step_id");

-- CreateIndex
CREATE INDEX "requests_requester_id_idx" ON "requests"("requester_id");

-- CreateIndex
CREATE INDEX "requests_template_id_idx" ON "requests"("template_id");

-- CreateIndex
CREATE INDEX "requests_current_status_idx" ON "requests"("current_status");

-- CreateIndex
CREATE INDEX "request_step_instances_request_id_idx" ON "request_step_instances"("request_id");

-- CreateIndex
CREATE INDEX "request_step_instances_assigned_to_user_id_idx" ON "request_step_instances"("assigned_to_user_id");

-- CreateIndex
CREATE INDEX "request_step_instances_status_idx" ON "request_step_instances"("status");

-- CreateIndex
CREATE INDEX "request_actions_request_id_idx" ON "request_actions"("request_id");

-- CreateIndex
CREATE INDEX "request_actions_request_step_instance_id_idx" ON "request_actions"("request_step_instance_id");

-- CreateIndex
CREATE INDEX "request_actions_actor_id_idx" ON "request_actions"("actor_id");

-- CreateIndex
CREATE INDEX "payments_request_id_idx" ON "payments"("request_id");

-- CreateIndex
CREATE INDEX "documents_request_id_idx" ON "documents"("request_id");

-- CreateIndex
CREATE INDEX "documents_request_action_id_idx" ON "documents"("request_action_id");

-- CreateIndex
CREATE INDEX "event_logs_request_id_idx" ON "event_logs"("request_id");

-- CreateIndex
CREATE INDEX "event_logs_occurred_at_idx" ON "event_logs"("occurred_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_request_id_idx" ON "notifications"("request_id");

-- CreateIndex
CREATE INDEX "ml_predictions_request_id_idx" ON "ml_predictions"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "system_settings_updated_by_idx" ON "system_settings"("updated_by");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_preferred_lang_fkey" FOREIGN KEY ("preferred_lang") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

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
