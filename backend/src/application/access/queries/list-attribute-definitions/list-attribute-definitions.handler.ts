import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { AttributeDefinitionRepository } from '../../../../domain/catalog/ports/attribute-definition.repository'
import { ATTRIBUTE_DEFINITION_REPOSITORY } from '../../../tokens'
import {
  AttributeDefinitionView,
  toAttributeDefinitionView,
} from '../views/attribute-definition.view'
import { ListAttributeDefinitionsQuery } from './list-attribute-definitions.query'

@QueryHandler(ListAttributeDefinitionsQuery)
export class ListAttributeDefinitionsHandler
  implements
    IQueryHandler<ListAttributeDefinitionsQuery, AttributeDefinitionView[]>
{
  constructor(
    @Inject(ATTRIBUTE_DEFINITION_REPOSITORY)
    private readonly attributeDefinitions: AttributeDefinitionRepository,
  ) {}

  async execute(): Promise<AttributeDefinitionView[]> {
    const definitions = await this.attributeDefinitions.list()
    return definitions.map((def) => toAttributeDefinitionView(def))
  }
}
