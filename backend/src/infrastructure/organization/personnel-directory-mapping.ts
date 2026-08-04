import { parse as parseYaml } from 'yaml'
import type {
  ExternalOrgUnit,
  ExternalUser,
} from '../../domain/organization/ports/department.repository'

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
  /** Optional people feed. Absent when the directory exposes units only. */
  users?: PersonnelUserMapping
}

/**
 * How the same personnel system describes people. Deliberately a separate block
 * with its own endpoint and recordsPath: units and people are usually two
 * different resources on the same service, and nothing says they share a shape.
 */
export interface PersonnelUserMapping {
  /** Appended to PERSONNEL_DIRECTORY_URL. Omit to use the base URL unchanged. */
  endpoint?: string
  recordsPath?: string
  fields: {
    institutionalNumber: string
    fullNameAr: string
    fullNameEn?: string
    email: string
    phone?: string
    userType: string
    departmentExternalId?: string
  }
  /** Translation from the source's person categories to our UserType codes. */
  userTypeMap?: Record<string, string>
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
    users: raw.users ? parseUserMapping(raw.users) : undefined,
  }
}

/** Validates the optional `users:` block. Same contract: throw on malformed. */
function parseUserMapping(raw: Partial<PersonnelUserMapping>): PersonnelUserMapping {
  const fields = raw.fields
  if (
    !fields ||
    !fields.institutionalNumber ||
    !fields.fullNameAr ||
    !fields.email ||
    !fields.userType
  )
    throw new Error(
      'Personnel directory users mapping must define fields.institutionalNumber, ' +
        'fields.fullNameAr, fields.email and fields.userType.',
    )
  return {
    endpoint: raw.endpoint,
    recordsPath: raw.recordsPath,
    fields: {
      institutionalNumber: fields.institutionalNumber,
      fullNameAr: fields.fullNameAr,
      fullNameEn: fields.fullNameEn,
      email: fields.email,
      phone: fields.phone,
      userType: fields.userType,
      departmentExternalId: fields.departmentExternalId,
    },
    userTypeMap: raw.userTypeMap ?? {},
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


/** Projects one raw record into an ExternalUser using the users mapping. */
export function toExternalUser(
  record: unknown,
  mapping: PersonnelUserMapping,
): ExternalUser {
  const { fields, userTypeMap } = mapping

  const institutionalNumber = readString(record, fields.institutionalNumber)
  if (!institutionalNumber)
    throw new Error(
      'A personnel directory person record is missing its institutional number.',
    )

  const nameAr = readString(record, fields.fullNameAr)
  if (!nameAr)
    throw new Error(`Person '${institutionalNumber}' is missing an Arabic name.`)

  const email = readString(record, fields.email)
  if (!email)
    throw new Error(`Person '${institutionalNumber}' is missing an email address.`)

  const nameEn = fields.fullNameEn
    ? readString(record, fields.fullNameEn)
    : undefined

  const rawUserType = readString(record, fields.userType)
  if (!rawUserType)
    throw new Error(`Person '${institutionalNumber}' is missing a user type.`)

  return {
    institutionalNumber,
    name: nameEn ? { ar: nameAr, en: nameEn } : { ar: nameAr },
    email,
    phone: fields.phone ? readString(record, fields.phone) : undefined,
    userType: userTypeMap?.[rawUserType] ?? rawUserType,
    departmentExternalId: fields.departmentExternalId
      ? (readString(record, fields.departmentExternalId) ?? null)
      : null,
  }
}
