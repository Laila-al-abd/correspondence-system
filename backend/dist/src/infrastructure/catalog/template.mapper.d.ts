import { Prisma } from '../../../generated/prisma/client';
import { Template } from '../../domain/catalog/template';
export declare const templateInclude: {
    fields: {
        include: {
            options: true;
        };
    };
    eligibilityRules: true;
};
type TemplateRow = Prisma.TemplateGetPayload<{
    include: typeof templateInclude;
}>;
export declare const TemplateMapper: {
    toDomain(row: TemplateRow): Template;
    toRoot(template: Template): Prisma.TemplateUncheckedCreateInput;
};
export {};
