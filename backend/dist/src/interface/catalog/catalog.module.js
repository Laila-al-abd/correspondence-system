"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const create_language_handler_1 = require("../../application/catalog/commands/create-language/create-language.handler");
const create_template_handler_1 = require("../../application/catalog/commands/create-template/create-template.handler");
const update_template_handler_1 = require("../../application/catalog/commands/update-template/update-template.handler");
const upsert_template_field_handler_1 = require("../../application/catalog/commands/upsert-template-field/upsert-template-field.handler");
const remove_template_field_handler_1 = require("../../application/catalog/commands/remove-template-field/remove-template-field.handler");
const reorder_template_fields_handler_1 = require("../../application/catalog/commands/reorder-template-fields/reorder-template-fields.handler");
const uuid_v7_id_generator_1 = require("../../infrastructure/shared/uuid-v7-id.generator");
const list_languages_handler_1 = require("../../application/catalog/queries/list-languages/list-languages.handler");
const list_action_types_handler_1 = require("../../application/catalog/queries/list-action-types/list-action-types.handler");
const list_template_catalog_handler_1 = require("../../application/catalog/queries/list-template-catalog/list-template-catalog.handler");
const get_template_catalog_handler_1 = require("../../application/catalog/queries/get-template-catalog/get-template-catalog.handler");
const prisma_language_repository_1 = require("../../infrastructure/catalog/prisma-language.repository");
const prisma_template_repository_1 = require("../../infrastructure/catalog/prisma-template.repository");
const prisma_template_catalog_query_1 = require("../../infrastructure/catalog/prisma-template-catalog.query");
const prisma_catalog_lookup_repository_1 = require("../../infrastructure/catalog/prisma-catalog-lookup.repository");
const tokens_1 = require("../../application/tokens");
const language_controller_1 = require("./language.controller");
const template_controller_1 = require("./template.controller");
const action_type_controller_1 = require("./action-type.controller");
let CatalogModule = class CatalogModule {
};
exports.CatalogModule = CatalogModule;
exports.CatalogModule = CatalogModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [language_controller_1.LanguageController, template_controller_1.TemplateController, action_type_controller_1.ActionTypeController],
        providers: [
            create_language_handler_1.CreateLanguageHandler,
            create_template_handler_1.CreateTemplateHandler,
            update_template_handler_1.UpdateTemplateHandler,
            upsert_template_field_handler_1.UpsertTemplateFieldHandler,
            remove_template_field_handler_1.RemoveTemplateFieldHandler,
            reorder_template_fields_handler_1.ReorderTemplateFieldsHandler,
            list_languages_handler_1.ListLanguagesHandler,
            list_action_types_handler_1.ListActionTypesHandler,
            list_template_catalog_handler_1.ListTemplateCatalogHandler,
            get_template_catalog_handler_1.GetTemplateCatalogHandler,
            { provide: tokens_1.LANGUAGE_REPOSITORY, useClass: prisma_language_repository_1.PrismaLanguageRepository },
            { provide: tokens_1.TEMPLATE_REPOSITORY, useClass: prisma_template_repository_1.PrismaTemplateRepository },
            { provide: tokens_1.TEMPLATE_CATALOG_QUERY, useClass: prisma_template_catalog_query_1.PrismaTemplateCatalogQuery },
            { provide: tokens_1.ID_GENERATOR, useClass: uuid_v7_id_generator_1.UuidV7IdGenerator },
            {
                provide: tokens_1.SENSITIVITY_LEVEL_REPOSITORY,
                useClass: prisma_catalog_lookup_repository_1.PrismaSensitivityLevelRepository,
            },
            {
                provide: tokens_1.REQUEST_CATEGORY_REPOSITORY,
                useClass: prisma_catalog_lookup_repository_1.PrismaRequestCategoryRepository,
            },
            { provide: tokens_1.ACTION_TYPE_REPOSITORY, useClass: prisma_catalog_lookup_repository_1.PrismaActionTypeRepository },
        ],
        exports: [
            tokens_1.TEMPLATE_REPOSITORY,
            tokens_1.TEMPLATE_CATALOG_QUERY,
            tokens_1.SENSITIVITY_LEVEL_REPOSITORY,
            tokens_1.REQUEST_CATEGORY_REPOSITORY,
            tokens_1.ACTION_TYPE_REPOSITORY,
        ],
    })
], CatalogModule);
//# sourceMappingURL=catalog.module.js.map