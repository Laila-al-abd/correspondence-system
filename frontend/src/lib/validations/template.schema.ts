// src/lib/validations/template.schema.ts
import { z } from 'zod';

// CREATE — nested-per-field, ar required, en optional but coupled to ar existing.
export const createTemplateSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[A-Za-z]/).optional(),
  categoryId: z.string().uuid().optional(),
  sensitivityLevelId: z.string().uuid().optional(),
  titleAr: z.string().min(1, 'Arabic title is required').max(255),
  titleEn: z.string().max(255).optional(),
  descriptionAr: z.string().min(1).max(2000).optional(),
  descriptionEn: z.string().max(2000).optional(),
  classifierDocument: z.string().min(1).max(1000).optional(),
}).refine(
  (data) => !data.descriptionEn || !!data.descriptionAr,
  { message: 'Cannot provide an English description without an Arabic description.', path: ['descriptionAr'] }
);
export type CreateTemplateFormValues = z.infer<typeof createTemplateSchema>;

// UPDATE — every field flat and fully independent. No ar/en coupling —
// UpdateTemplateHandler allows titleEn/descriptionEn without their Arabic
// counterpart (it falls back to the existing stored value for whichever
// field wasn't sent, per `input.titleAr ?? before.title.ar`).
export const updateTemplateSchema = z.object({
  titleAr: z.string().min(1).max(255).optional(),
  titleEn: z.string().max(255).optional(),
  descriptionAr: z.string().max(2000).nullable().optional(),
  descriptionEn: z.string().max(2000).optional(),
  classifierDocument: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateTemplateFormValues = z.infer<typeof updateTemplateSchema>;