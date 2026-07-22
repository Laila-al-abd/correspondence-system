import { OrgUnitType } from '../../domain/organization/org-unit-type'
import { OrgUnitKind } from '../../domain/organization/enums'
import { Identifier } from '../../domain/shared/identifier'
import { LocalizedText } from '../../domain/shared/localized-text'
import { OrgUnitType as OrgUnitTypeRow } from '../../../generated/prisma/client'

/** Translates an `org_unit_types` row into the OrgUnitType entity. */
export const OrgUnitTypeMapper = {
  toDomain(row: OrgUnitTypeRow): OrgUnitType {
    const name = row.name as unknown as { ar: string; en?: string }
    return OrgUnitType.rehydrate(Identifier.of(row.id), {
      kind: row.code as OrgUnitKind,
      name: LocalizedText.create(name.ar, name.en),
    })
  },
}
