import { TemplateCatalogView } from "../views/template-catalog.view"

/**
 * Read port for the template catalogue. Separate from TemplateRepository on
 * purpose: the repository rebuilds the whole aggregate for writing, while this
 * projects flat rows for reading, including `updatedAt`, which the aggregate
 * does not carry.
 */
export interface TemplateCatalogQueryPort {
  list(filter?: { onlyActive?: boolean }): Promise<TemplateCatalogView[]>
  /** Accepts either the UUID or the stable code (ENROLL_CERT). */
  findByIdOrCode(idOrCode: string): Promise<TemplateCatalogView | null>
}
