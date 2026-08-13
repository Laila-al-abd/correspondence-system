import type { Template } from '../../../../domain/catalog/template';
export interface EligibleTemplateView {
    id: string;
    title: {
        ar: string;
        en?: string;
    };
    categoryId?: string;
    sensitivityLevelId?: string;
}
export declare function toEligibleTemplateView(template: Template): EligibleTemplateView;
