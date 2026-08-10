// src/lib/validations/workflow-path.schema.ts
import { z } from 'zod';
import { AssigneeType } from '@/types/workflow';

/**
 * Localized text schema matching backend LocalizedTextDto:
 * - ar: required, 1-255 chars
 * - en: optional, 1-255 chars if present, but cannot be provided without ar
 */
const localizedTextSchema = z.object({
  ar: z.string().min(1, 'Arabic text is required').max(255, 'Must be 255 characters or fewer'),
  en: z.string().max(255, 'Must be 255 characters or fewer').optional(),
}).refine(
  (data) => !data.en || !!data.ar,
  { message: 'Cannot provide English text without Arabic text.', path: ['en'] }
);

/**
 * Individual workflow step schema matching backend WorkflowStepDto
 */
const workflowStepSchema = z.object({
  key: z.string().min(1, 'Key is required').max(100, 'Key must be 100 characters or fewer'),
  name: localizedTextSchema,
  description: localizedTextSchema.optional(),
  assigneeType: z.nativeEnum(AssigneeType),
  assigneeRoleId: z.string().uuid('Invalid role ID').optional().or(z.literal('')),
  assigneeDepartmentId: z.string().uuid('Invalid department ID').optional().or(z.literal('')),
  defaultActionTypeId: z.string().uuid('Invalid action type ID').optional().or(z.literal('')),
  slaHours: z.number().int().min(1, 'SLA hours must be at least 1').optional(),
  pausesSla: z.boolean().optional(),
  allowedActionTypeIds: z.array(z.string().uuid('Invalid action type ID')).optional(),
  dependsOn: z.array(z.string().min(1)).optional(),
}).refine(
  (step) => step.assigneeType !== AssigneeType.SPECIFIC_ROLE || !!step.assigneeRoleId,
  { message: 'Role is required when assignee type is "Specific Role"', path: ['assigneeRoleId'] }
).refine(
  (step) => step.assigneeType !== AssigneeType.SPECIFIC_UNIT || !!step.assigneeDepartmentId,
  { message: 'Department is required when assignee type is "Specific Unit"', path: ['assigneeDepartmentId'] }
);

/**
 * Main define workflow path schema matching backend DefineWorkflowPathDto
 * - templateId: required string (UUID expected but not strictly enforced here)
 * - name: required LocalizedTextDto
 * - description: optional LocalizedTextDto
 * - steps: required non-empty array of WorkflowStepDto
 * - activate: optional boolean
 */
export const defineWorkflowPathSchema = z.object({
  templateId: z.string().min(1, 'Template is required'),
  name: localizedTextSchema,
  description: localizedTextSchema.optional(),
  steps: z.array(workflowStepSchema).min(1, 'At least one step is required'),
  activate: z.boolean().optional(),
}).refine(
  (data) => {
    // Check for duplicate step keys
    const keys = data.steps.map((s) => s.key);
    const duplicates = keys.filter((k, i) => keys.indexOf(k) !== i);
    return duplicates.length === 0;
  },
  { message: 'Duplicate step keys are not allowed', path: ['steps'] }
).refine(
  (data) => {
    // Validate dependsOn references existing step keys
    const stepKeys = new Set(data.steps.map((s) => s.key));
    for (const step of data.steps) {
      if (step.dependsOn?.length) {
        for (const dep of step.dependsOn) {
          if (!stepKeys.has(dep)) {
            return false;
          }
        }
      }
    }
    return true;
  },
  { message: 'dependsOn references an unknown step key', path: ['steps'] }
);

/**
 * Form values type inferred from the schema.
 * Input and output are the same (no transforms/coercions that change types),
 * so we export a single inferred type.
 */
export type DefineWorkflowPathFormValues = z.infer<typeof defineWorkflowPathSchema>;