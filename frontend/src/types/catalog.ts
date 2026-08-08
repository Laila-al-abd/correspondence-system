/**
 * Frontend TypeScript types for the Catalog module.
 * Synchronized with backend DTOs, command interfaces, and query views.
 * Generated from:
 * - backend/src/interface/catalog/dto/*.dto.ts
 * - backend/src/application/catalog/commands/**.command.ts
 * - backend/src/application/catalog/queries/views/*.view.ts
 * - backend/src/domain/catalog/enums.ts
 * - backend/src/domain/request/enums.ts
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Data types for attribute definitions and template fields.
 * Source: backend/src/domain/catalog/enums.ts
 */
export enum AttributeDataType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  ENUM = 'ENUM',
}

/**
 * Data types for template fields (alias of AttributeDataType for semantic clarity).
 * Source: backend/src/domain/catalog/enums.ts
 */
export enum FieldDataType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  ENUM = 'ENUM',
}

/**
 * Priority levels for request templates.
 * Source: backend/src/domain/request/enums.ts
 */
export enum Priority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// ============================================================================
// DTO Types (matching backend DTOs)
// ============================================================================

/**
 * Request body for creating a language.
 * POST /languages
 * Matches: backend/src/interface/catalog/dto/create-language.dto.ts
 */
export interface CreateLanguageDto {
  /** Language code (2-10 characters) */
  code: string;

  /** Language name */
  name: string;

  /** Native language name */
  nativeName: string;

  /** Whether the language is enabled (optional) */
  isEnabled?: boolean;

  /** Whether this is the default language (optional) */
  isDefault?: boolean;
}

/**
 * One choice of an ENUM field.
 * Matches: backend/src/interface/catalog/dto/template-field.dto.ts (TemplateFieldOptionDto)
 */
export interface TemplateFieldOptionDto {
  /** The value stored in filled_data */
  value: string;

  /** Arabic label */
  labelAr: string;

  /** English label (optional) */
  labelEn?: string;
}

/**
 * A field definition for templates.
 * Matches: backend/src/interface/catalog/dto/template-field.dto.ts (TemplateFieldDto)
 */
export interface TemplateFieldDto {
  /** Field key (lower_snake_case, 2-50 chars, starts with letter) */
  key: string;

  /** Arabic label */
  labelAr: string;

  /** English label (optional) */
  labelEn?: string;

  /** Data type of the field */
  dataType: FieldDataType;

  /** Whether the field is required (optional, defaults to false) */
  isRequired?: boolean;

  /** Arabic question for extractive QA model (optional) */
  extractionQuestion?: string;

  /** Options for ENUM fields (optional) */
  options?: TemplateFieldOptionDto[];
}

/**
 * PUT /templates/:id/fields -- add the field, or redefine it if it exists.
 * Matches: backend/src/interface/catalog/dto/template-field.dto.ts (UpsertTemplateFieldDto)
 */
export interface UpsertTemplateFieldDto extends TemplateFieldDto {
  /** Position in the form (optional) */
  ordinal?: number;
}

/**
 * POST /templates/:id/fields/reorder
 * Matches: backend/src/interface/catalog/dto/template-field.dto.ts (ReorderTemplateFieldsDto)
 */
export interface ReorderTemplateFieldsDto {
  /** Field keys in the desired order */
  fieldKeys: string[];
}

/**
 * Request body for creating a template.
 * POST /templates
 * Matches: backend/src/interface/catalog/dto/create-template.dto.ts
 */
export interface CreateTemplateDto {
  /** Stable machine name (optional, write-once, 2-50 chars, starts with letter) */
  code?: string;

  /** Category ID (UUID) - optional */
  categoryId?: string;

  /** Sensitivity level ID (UUID) - optional */
  sensitivityLevelId?: string;

  /** Arabic title (1-255 chars) */
  titleAr: string;

  /** English title (optional, 1-255 chars) */
  titleEn?: string;

  /** Arabic description (optional, 1-2000 chars) */
  descriptionAr?: string;

  /** English description (optional, 1-2000 chars) */
  descriptionEn?: string;

  /** Default priority (optional) */
  defaultPriority?: Priority;

  /** Exact Arabic text for classifier embedding (optional, 1-4000 chars) */
  classifierDocument?: string;

  /** Optional initial fields in form order */
  fields?: TemplateFieldDto[];
}

/**
 * Request body for updating a template.
 * PATCH /templates/:id
 * Matches: backend/src/interface/catalog/dto/update-template.dto.ts
 */
export interface UpdateTemplateDto {
  /** Stable machine name (optional, write-once, only if template has no code) */
  code?: string;

  /** Category ID (optional, UUID) */
  categoryId?: string;

  /** Sensitivity level ID (optional, UUID) */
  sensitivityLevelId?: string;

  /** Arabic title (optional, 1-255 chars) */
  titleAr?: string;

  /** English title (optional, 1-255 chars) */
  titleEn?: string;

  /** Arabic description (optional, 0-2000 chars, null means clear) */
  descriptionAr?: string | null;

  /** English description (optional, 0-2000 chars) */
  descriptionEn?: string;

  /** Default priority (optional) */
  defaultPriority?: Priority;

  /** Classifier document (optional, 0-4000 chars, null means clear) */
  classifierDocument?: string | null;

  /** Whether template is active (optional) */
  isActive?: boolean;
}

// ============================================================================
// Command Input Types (matching backend command interfaces)
// ============================================================================

/**
 * Input for CreateLanguageCommand.
 * Matches: backend/src/application/catalog/commands/create-language/create-language.command.ts
 */
export interface CreateLanguageInput {
  code: string;
  name: string;
  nativeName: string;
  isEnabled?: boolean;
  isDefault?: boolean;
}

/**
 * One allowed choice of an ENUM field, as an authoring caller states it.
 * Matches: backend/src/application/catalog/commands/template-field.factory.ts (TemplateFieldOptionInput)
 */
export interface TemplateFieldOptionInput {
  value: string;
  labelAr: string;
  labelEn?: string;
}

/**
 * A field definition as an authoring caller states it.
 * Matches: backend/src/application/catalog/commands/template-field.factory.ts (TemplateFieldInput)
 */
export interface TemplateFieldInput {
  /** Field key (lower_snake_case) */
  key: string;

  /** Arabic label */
  labelAr: string;

  /** English label (optional) */
  labelEn?: string;

  /** Data type of the field */
  dataType: FieldDataType;

  /** Whether the field is required (optional, defaults to false) */
  isRequired?: boolean;

  /** Arabic question for extractive QA model (optional) */
  extractionQuestion?: string;

  /** Options for ENUM fields (optional) */
  options?: TemplateFieldOptionInput[];
}

/**
 * Input for CreateTemplateCommand.
 * Matches: backend/src/application/catalog/commands/create-template/create-template.command.ts
 */
export interface CreateTemplateInput {
  /** Stable machine name (optional, write-once) */
  code?: string;

  /** Category ID (UUID) - optional */
  categoryId?: string;

  /** Sensitivity level ID (UUID) - optional */
  sensitivityLevelId?: string;

  /** Arabic title */
  titleAr: string;

  /** English title (optional) */
  titleEn?: string;

  /** Arabic description (optional) */
  descriptionAr?: string;

  /** English description (optional) */
  descriptionEn?: string;

  /** Default priority (optional) */
  defaultPriority?: Priority;

  /** Classifier document (optional) */
  classifierDocument?: string;

  /** Optional initial fields, in form order */
  fields?: TemplateFieldInput[];
}

/**
 * Input for UpdateTemplateCommand.
 * Matches: backend/src/application/catalog/commands/update-template/update-template.command.ts
 */
export interface UpdateTemplateInput {
  templateId: string;
  /** Only accepted while the template has no code; codes are write-once. */
  code?: string;
  categoryId?: string;
  sensitivityLevelId?: string;
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string | null;
  descriptionEn?: string;
  defaultPriority?: Priority;
  classifierDocument?: string | null;
  isActive?: boolean;
}

/**
 * Input for UpsertTemplateFieldCommand.
 * Matches: backend/src/application/catalog/commands/upsert-template-field/upsert-template-field.command.ts
 */
export interface UpsertTemplateFieldInput {
  templateId: string;
  field: TemplateFieldInput;
  /** Where in the form it sits. Defaults to its current place, or last. */
  ordinal?: number;
}

/**
 * Input for RemoveTemplateFieldCommand.
 * Matches: backend/src/application/catalog/commands/remove-template-field/remove-template-field.command.ts
 */
export interface RemoveTemplateFieldInput {
  templateId: string;
  fieldKey: string;
}

/**
 * Input for ReorderTemplateFieldsCommand.
 * Matches: backend/src/application/catalog/commands/reorder-template-fields/reorder-template-fields.command.ts
 */
export interface ReorderTemplateFieldsInput {
  templateId: string;
  /** Every declared field key, exactly once, in the order to present them. */
  fieldKeys: string[];
}

// ============================================================================
// Query View Types (matching backend query views)
// ============================================================================

/**
 * Read model for a language returned by Catalog queries.
 * Source: backend/src/application/catalog/queries/list-languages/language.view.ts
 */
export interface LanguageView {
  /** Language code */
  code: string;

  /** Language name */
  name: string;

  /** Native language name */
  nativeName: string;

  /** Whether the language is enabled */
  isEnabled: boolean;

  /** Whether this is the default language */
  isDefault: boolean;
}

/**
 * A single field in the template catalog view.
 * Source: backend/src/application/catalog/queries/views/template-catalog.view.ts (TemplateFieldCatalogView)
 */
export interface TemplateFieldCatalogView {
  /** Field key */
  key: string;

  /** Arabic label */
  labelAr: string;

  /** English label (optional) */
  labelEn?: string;

  /** Data type as string */
  dataType: string;

  /** Whether the field is required */
  isRequired: boolean;

  /** Position in the form */
  ordinal: number;

  /** Arabic question for extractive QA model (optional) */
  extractionQuestion?: string;

  /** Allowed codes for ENUM fields; empty for other types */
  options: { value: string; labelAr: string; labelEn?: string }[];
}

/**
 * Template catalog view - rich view for AI service and authoring UI.
 * Source: backend/src/application/catalog/queries/views/template-catalog.view.ts (TemplateCatalogView)
 */
export interface TemplateCatalogView {
  /** Unique identifier */
  id: string;

  /** Stable machine name (optional) */
  code?: string;

  /** Arabic name/title */
  nameAr: string;

  /** English name/title (optional) */
  nameEn?: string;

  /** Arabic description (optional) */
  descriptionAr?: string;

  /** English description (optional) */
  descriptionEn?: string;

  /**
   * The exact text the classifier embeds. Falls back to the Arabic description
   * when no dedicated document was authored, so a template an administrator
   * adds through the UI works zero-shot with no extra step.
   */
  classifierDocument?: string;

  /** Category ID - optional */
  categoryId?: string;

  /** Sensitivity level ID - optional */
  sensitivityLevelId?: string;

  /** Whether template is active */
  isActive: boolean;

  /** Last update timestamp (ISO string) */
  updatedAt: string;

  /** Form fields in order */
  fields: TemplateFieldCatalogView[];
}

// ============================================================================
// Response Types (for API responses)
// ============================================================================

/**
 * Response for creating a template.
 * POST /templates
 * Matches: CreateTemplateHandler's CreateTemplateResult, returned unwrapped
 * by TemplateController.create. Verified.
 */
export interface CreateTemplateResponse {
  /** The created template ID */
  id: string;
  /** Stable machine code (if provided) */
  code?: string;
  /** Number of fields created */
  fieldCount: number;
}

/**
 * Response for updating/retiring a template.
 * PATCH /templates/:id, DELETE /templates/:id
 * Matches: UpdateTemplateHandler's UpdateTemplateResult. Both routes share
 * this same result type — verified against TemplateController.update and
 * .retire, which both delegate to UpdateTemplateCommand.
 */
export interface UpdateTemplateResponse {
  /** The template ID */
  id: string;
  /** Stable machine code (if assigned) */
  code?: string;
  /** Whether the template is active */
  isActive: boolean;
}

/**
 * Response for upserting a template field.
 * PUT /templates/:id/fields
 * Matches: UpsertTemplateFieldHandler's UpsertTemplateFieldResult, returned
 * unwrapped. Verified.
 */
export interface UpsertTemplateFieldResponse {
  /** Template ID */
  templateId: string;
  /** Field key */
  fieldKey: string;
  /** Whether this was a new field (true) or update (false) */
  created: boolean;
  /** Position in the form */
  ordinal: number;
}

/**
 * Response for reordering template fields.
 * POST /templates/:id/fields/reorder
 * Matches: ReorderTemplateFieldsHandler's ReorderTemplateFieldsResult,
 * returned unwrapped. Verified.
 */
export interface ReorderTemplateFieldsResponse {
  /** Template ID */
  templateId: string;
  /** Field keys in new order */
  fieldKeys: string[];
}

/**
 * Response for removing a template field.
 * DELETE /templates/:id/fields/:fieldKey
 * Matches: RemoveTemplateFieldHandler's RemoveTemplateFieldResult, returned
 * unwrapped. Verified.
 */
export interface RemoveTemplateFieldResponse {
  /** Template ID */
  templateId: string;
  /** Removed field key */
  fieldKey: string;
  /** Number of remaining fields */
  remainingFields: number;
}

/**
 * Response for creating a language.
 * POST /languages
 * Matches: CreateLanguageHandler returns a raw string; LanguageController.create
 * wraps it into { code }. Verified — this is the one confirmed case in this
 * codebase where the controller reshapes the handler's result rather than
 * returning it as-is, so both hops were checked separately.
 */
export interface CreateLanguageResponse {
  /** The created language code */
  code: string;
}