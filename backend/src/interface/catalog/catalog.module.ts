import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { CreateLanguageHandler } from '../../application/catalog/commands/create-language/create-language.handler'
import { CreateTemplateHandler } from '../../application/catalog/commands/create-template/create-template.handler'
import { UpdateTemplateHandler } from '../../application/catalog/commands/update-template/update-template.handler'
import { UpsertTemplateFieldHandler } from '../../application/catalog/commands/upsert-template-field/upsert-template-field.handler'
import { RemoveTemplateFieldHandler } from '../../application/catalog/commands/remove-template-field/remove-template-field.handler'
import { ReorderTemplateFieldsHandler } from '../../application/catalog/commands/reorder-template-fields/reorder-template-fields.handler'
import { UuidV7IdGenerator } from '../../infrastructure/shared/uuid-v7-id.generator'
import { ListLanguagesHandler } from '../../application/catalog/queries/list-languages/list-languages.handler'
import { ListTemplateCatalogHandler } from '../../application/catalog/queries/list-template-catalog/list-template-catalog.handler'
import { GetTemplateCatalogHandler } from '../../application/catalog/queries/get-template-catalog/get-template-catalog.handler'
import { PrismaLanguageRepository } from '../../infrastructure/catalog/prisma-language.repository'
import { PrismaTemplateRepository } from '../../infrastructure/catalog/prisma-template.repository'
import { PrismaTemplateCatalogQuery } from '../../infrastructure/catalog/prisma-template-catalog.query'
import {
  PrismaSensitivityLevelRepository,
  PrismaRequestCategoryRepository,
  PrismaActionTypeRepository,
} from '../../infrastructure/catalog/prisma-catalog-lookup.repository'
import {
  ID_GENERATOR,
  LANGUAGE_REPOSITORY,
  TEMPLATE_REPOSITORY,
  TEMPLATE_CATALOG_QUERY,
  SENSITIVITY_LEVEL_REPOSITORY,
  REQUEST_CATEGORY_REPOSITORY,
  ACTION_TYPE_REPOSITORY,
} from '../../application/tokens'
import { LanguageController } from './language.controller'
import { TemplateController } from './template.controller'

/**
 * Catalog composition root: wires the LANGUAGE_REPOSITORY port to its Prisma
 * adapter and registers the command/query handlers.
 */
@Module({
  imports: [CqrsModule],
  controllers: [LanguageController, TemplateController],
  providers: [
    CreateLanguageHandler,
    CreateTemplateHandler,
    UpdateTemplateHandler,
    UpsertTemplateFieldHandler,
    RemoveTemplateFieldHandler,
    ReorderTemplateFieldsHandler,
    ListLanguagesHandler,
    ListTemplateCatalogHandler,
    GetTemplateCatalogHandler,
    { provide: LANGUAGE_REPOSITORY, useClass: PrismaLanguageRepository },
    { provide: TEMPLATE_REPOSITORY, useClass: PrismaTemplateRepository },
    { provide: TEMPLATE_CATALOG_QUERY, useClass: PrismaTemplateCatalogQuery },
    // Authoring mints template and field ids; the read paths do not need this.
    { provide: ID_GENERATOR, useClass: UuidV7IdGenerator },
    {
      provide: SENSITIVITY_LEVEL_REPOSITORY,
      useClass: PrismaSensitivityLevelRepository,
    },
    {
      provide: REQUEST_CATEGORY_REPOSITORY,
      useClass: PrismaRequestCategoryRepository,
    },
    { provide: ACTION_TYPE_REPOSITORY, useClass: PrismaActionTypeRepository },
  ],
  exports: [
    TEMPLATE_REPOSITORY,
    TEMPLATE_CATALOG_QUERY,
    SENSITIVITY_LEVEL_REPOSITORY,
    REQUEST_CATEGORY_REPOSITORY,
    ACTION_TYPE_REPOSITORY,
  ],
})
export class CatalogModule {}
