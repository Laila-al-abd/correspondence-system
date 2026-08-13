import { TemplateCatalogView } from "../views/template-catalog.view";
export interface TemplateCatalogQueryPort {
    list(filter?: {
        onlyActive?: boolean;
    }): Promise<TemplateCatalogView[]>;
    findByIdOrCode(idOrCode: string): Promise<TemplateCatalogView | null>;
}
