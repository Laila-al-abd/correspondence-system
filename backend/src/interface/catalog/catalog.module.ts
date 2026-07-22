import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { CreateLanguageHandler } from '../../application/catalog/commands/create-language/create-language.handler'
import { ListLanguagesHandler } from '../../application/catalog/queries/list-languages/list-languages.handler'
import { PrismaLanguageRepository } from '../../infrastructure/catalog/prisma-language.repository'
import { PrismaTemplateRepository } from '../../infrastructure/catalog/prisma-template.repository'
import {
  PrismaSensitivityLevelRepository,
  PrismaRequestCategoryRepository,
  PrismaActionTypeRepository,
} from '../../infrastructure/catalog/prisma-catalog-lookup.repository'
import {
  LANGUAGE_REPOSITORY,
  TEMPLATE_REPOSITORY,
  SENSITIVITY_LEVEL_REPOSITORY,
  REQUEST_CATEGORY_REPOSITORY,
  ACTION_TYPE_REPOSITORY,
} from '../../application/tokens'
import { LanguageController } from './language.controller'

/**
 * Catalog composition root: wires the LANGUAGE_REPOSITORY port to its Prisma
 * adapter and registers the command/query handlers.
 */
@Module({
  imports: [CqrsModule],
  controllers: [LanguageController],
  providers: [
    CreateLanguageHandler,
    ListLanguagesHandler,
    { provide: LANGUAGE_REPOSITORY, useClass: PrismaLanguageRepository },
    { provide: TEMPLATE_REPOSITORY, useClass: PrismaTemplateRepository },
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
    SENSITIVITY_LEVEL_REPOSITORY,
    REQUEST_CATEGORY_REPOSITORY,
    ACTION_TYPE_REPOSITORY,
  ],
})
export class CatalogModule {}
