import { parse as parseYaml } from 'yaml'
import type { ExternalOrgUnit } from '../../domain/organization/ports/department.repository'

/**
 * Declarative description of how a specific personnel system's records map onto
 * our canonical ExternalOrgUnit. Kept in a YAML file so onboarding a new source
 * (or absorbing a schema change on an existing one) is a config edit rather than
 * a code change.
 */
export interface PersonnelDirectoryMapping {
  /** Dot-path to the array of records inside the HTTP response. Omit when the response is already an array. */
  recordsPath?: string
  /** Dot-paths (relative to a single record) for each canonical field. */
  fields: {
    externalId: string
    parentExternalId?: string
    nameAr: string
    nameEn?: string
    unitType: string
  }
  /** Optional translation from the source's unit-type codes to our OrgUnitType codes. */
  unitTypeMap?: Record<string, string>
}

/** Parses and validates the YAML field-mapping. Throws on a malformed file. */
export function parseMapping(yamlText: string): PersonnelDirectoryMapping {
  const raw = parseYaml(yamlText) as Partial<PersonnelDirectoryMapping> | null
  if (!raw || typeof raw !== 'object')
    throw new Error('Personnel directory mapping is empty or not an object.')
  const fields = raw.fields
  if (!fields || !fields.externalId || !fields.nameAr || !fields.unitType)
    throw new Error(
      'Personnel directory mapping must define fields.externalId, fields.nameAr and fields.unitType.',
    )
  return {
    recordsPath: raw.recordsPath,
    fields: {
      externalId: fields.externalId,
      parentExternalId: fields.parentExternalId,
      nameAr: fields.nameAr,
      nameEn: fields.nameEn,
      unitType: fields.unitType,
    },
    unitTypeMap: raw.unitTypeMap ?? {},
  }
}

/** Reads a nested value by dot-path (e.g. 'name.ar'); returns undefined if any hop is missing. */
export function readPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (value && typeof value === 'object')
      return (value as Record<string, unknown>)[key]
    return undefined
  }, source)
}

function readString(record: unknown, path: string): string | undefined {
  const value = readPath(record, path)
  if (value === undefined || value === null) return undefined
  return String(value)
}

/** Extracts the records array from a raw HTTP payload according to the mapping. */
export function extractRecords(
  payload: unknown,
  mapping: PersonnelDirectoryMapping,
): unknown[] {
  const container = mapping.recordsPath
    ? readPath(payload, mapping.recordsPath)
    : payload
  if (!Array.isArray(container))
    throw new Error(
      mapping.recordsPath
        ? `Personnel directory response has no array at '${mapping.recordsPath}'.`
        : 'Personnel directory response is not an array.',
    )
  return container
}

/** Projects one raw record into an ExternalOrgUnit using the mapping. */
export function toExternalOrgUnit(
  record: unknown,
  mapping: PersonnelDirectoryMapping,
): ExternalOrgUnit {
  const { fields, unitTypeMap } = mapping

  const externalId = readString(record, fields.externalId)
  if (!externalId)
    throw new Error('A personnel directory record is missing its external id.')

  const nameAr = readString(record, fields.nameAr)
  if (!nameAr)
    throw new Error(`Record '${externalId}' is missing its Arabic name.`)

  const nameEn = fields.nameEn ? readString(record, fields.nameEn) : undefined

  const parentExternalId = fields.parentExternalId
    ? (readString(record, fields.parentExternalId) ?? null)
    : null

  const rawUnitType = readString(record, fields.unitType)
  if (!rawUnitType)
    throw new Error(`Record '${externalId}' is missing its unit type.`)
  const unitType = unitTypeMap?.[rawUnitType] ?? rawUnitType

  return {
    externalId,
    parentExternalId,
    name: nameEn ? { ar: nameAr, en: nameEn } : { ar: nameAr },
    unitType,
  }
}
