import { Repository } from "../../shared/repository"
import { Identifier } from "../../shared/identifier"
import { Template } from "../template"

export interface TemplateRepository extends Repository<Template> {
  listActive(): Promise<Template[]>
  listByCategory(categoryId: Identifier): Promise<Template[]>
}
