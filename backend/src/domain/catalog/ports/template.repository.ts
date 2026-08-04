import { Repository } from "../../shared/repository"
import { Identifier } from "../../shared/identifier"
import { Template } from "../template"

export interface TemplateRepository extends Repository<Template> {
  findByCode(code: string): Promise<Template | null>
  listActive(): Promise<Template[]>
  listByCategory(categoryId: Identifier): Promise<Template[]>
}
