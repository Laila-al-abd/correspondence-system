/**
 * The catalogue as the AI service and the authoring UI need to see it.
 *
 * This is deliberately richer than the template list a requester would get. The
 * classifier needs `classifierDocument` (the text it embeds) and the extractor
 * needs `extractionQuestion` per field; both are model inputs, so they travel
 * with the catalogue rather than being duplicated in the AI service.
 */
export interface TemplateFieldCatalogView {
  key: string
  labelAr: string
  labelEn?: string
  dataType: string
  isRequired: boolean
  ordinal: number
  /** Arabic question the extractive QA model is asked. Verbatim, never reworded. */
  extractionQuestion?: string
  /** Allowed codes for ENUM fields; empty for every other type. */
  options: { value: string; labelAr: string; labelEn?: string }[]
}

export interface TemplateCatalogView {
  id: string
  code?: string
  nameAr: string
  nameEn?: string
  descriptionAr?: string
  descriptionEn?: string
  /**
   * The exact text the classifier embeds. Falls back to the Arabic description
   * when no dedicated document was authored, so a template an administrator
   * adds through the UI works zero-shot with no extra step.
   */
  classifierDocument?: string
  categoryId?: string
  sensitivityLevelId?: string
  isActive: boolean
  /** Lets the AI service poll cheaply and rebuild only when something changed. */
  updatedAt: string
  fields: TemplateFieldCatalogView[]
}
