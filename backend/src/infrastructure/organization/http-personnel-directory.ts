import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import type {
  ExternalOrgUnit,
  ExternalUser,
  PersonnelDirectory,
} from '../../domain/organization/ports/department.repository'
import {
  PersonnelDirectoryMapping,
  extractRecords,
  parseMapping,
  toExternalOrgUnit,
  toExternalUser,
} from './personnel-directory-mapping'
import { UpstreamUnavailableError } from '../../application/errors'

const DEFAULT_MAPPING_PATH = 'config/personnel-directory.mapping.yaml'
const DEFAULT_TIMEOUT_MS = 10_000

/**
 * Sanity ceiling on a single directory response.
 *
 * This feed is not paged, and paging it is not ours to design: the upstream
 * system would have to offer a convention, and it has not been specified yet.
 * What we can do is refuse to be harmed by an answer that is absurd. A roster
 * larger than this means a misconfigured endpoint, a test fixture pointed at
 * production, or an upstream bug -- and holding all of it in memory to find
 * out would take the whole application down with it.
 *
 * It fails loudly rather than truncating. A silently shortened roster would be
 * imported as if it were complete, and the people missing from it would look,
 * to every screen in this system, like people who do not work here.
 */
const MAX_DIRECTORY_RECORDS = 20_000

/**
 * HTTP adapter for the university's external personnel system. It fetches the
 * raw unit list over HTTP and reshapes it into ExternalOrgUnit values using a
 * YAML field-mapping, so the domain and the SyncDepartmentsFromDirectory
 * use-case never see the wire format. Endpoint, credentials, and mapping path
 * all come from the environment via ConfigService.
 */
@Injectable()
export class HttpPersonnelDirectory implements PersonnelDirectory {
  private mappingCache?: PersonnelDirectoryMapping
  /** Modification time of the file the cache was built from. */
  private mappingCacheMtimeMs?: number

  constructor(private readonly config: ConfigService) {}

  async fetchUnits(): Promise<ExternalOrgUnit[]> {
    const url = this.config.get<string>('PERSONNEL_DIRECTORY_URL')
    if (!url)
      throw new UpstreamUnavailableError(
        'Personnel directory is not configured (set PERSONNEL_DIRECTORY_URL).',
      )

    const mapping = this.loadMapping()
    const payload = await this.get(url)
    const records = guardSize(extractRecords(payload, mapping), 'units')
    return records.map((record) => toExternalOrgUnit(record, mapping))
  }

  /**
   * The people feed. Returns null -- rather than an empty array -- when the
   * mapping file has no `users:` block, so the caller can tell "this directory
   * does not publish people" from "it published nobody today". Treating those
   * the same would let a deleted config block look like an empty roster.
   */
  async fetchUsers(): Promise<ExternalUser[] | null> {
    const baseUrl = this.config.get<string>('PERSONNEL_DIRECTORY_URL')
    if (!baseUrl)
      throw new UpstreamUnavailableError(
        'Personnel directory is not configured (set PERSONNEL_DIRECTORY_URL).',
      )

    const users = this.loadMapping().users
    if (!users) return null

    const payload = await this.get(this.join(baseUrl, users.endpoint))
    const records = guardSize(
      extractRecords(payload, {
        recordsPath: users.recordsPath,
        fields: {
          externalId: users.fields.institutionalNumber,
          nameAr: users.fields.fullNameAr,
          unitType: users.fields.userType,
        },
      }),
      'people',
    )
    return records.map((record) => toExternalUser(record, users))
  }

  /** Joins the configured base URL with the feed's relative endpoint. */
  private join(baseUrl: string, endpoint?: string): string {
    if (!endpoint) return baseUrl
    return `${baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`
  }

  /**
   * Returns the field-mapping, re-reading the file whenever it has changed on
   * disk.
   *
   * The point of putting the mapping in YAML was that an operator could adapt
   * to the personnel system renaming a field without a developer. Caching it
   * for the lifetime of the process undermined exactly that: the edit was free,
   * but it took a restart to have any effect. Comparing the modification time
   * costs one stat() per sync -- negligible next to the HTTP call that follows
   * -- and makes the file behave the way its own comment promises.
   *
   * If the edited file is malformed, parseMapping throws and the previous cache
   * is left untouched, so a typo fails that one sync rather than poisoning the
   * cache with a half-parsed mapping.
   */
  private loadMapping(): PersonnelDirectoryMapping {
    const mappingPath =
      this.config.get<string>('PERSONNEL_DIRECTORY_MAPPING_PATH') ??
      DEFAULT_MAPPING_PATH
    const absolutePath = resolve(process.cwd(), mappingPath)
    const mtimeMs = statSync(absolutePath).mtimeMs

    if (this.mappingCache && this.mappingCacheMtimeMs === mtimeMs)
      return this.mappingCache

    const text = readFileSync(absolutePath, 'utf-8')
    const parsed = parseMapping(text)
    this.mappingCache = parsed
    this.mappingCacheMtimeMs = mtimeMs
    return parsed
  }

  private async get(url: string): Promise<unknown> {
    const timeoutMs =
      Number(this.config.get<string>('PERSONNEL_DIRECTORY_TIMEOUT_MS')) ||
      DEFAULT_TIMEOUT_MS
    const apiKey = this.config.get<string>('PERSONNEL_DIRECTORY_API_KEY')

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(url, {
        headers: {
          accept: 'application/json',
          ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
        },
        signal: controller.signal,
      })
      if (!response.ok)
        throw new UpstreamUnavailableError(
          `Personnel directory responded with HTTP ${response.status}.`,
        )
      return await response.json()
    } catch (error) {
      if (error instanceof UpstreamUnavailableError) throw error
      if (error instanceof Error && error.name === 'AbortError')
        throw new UpstreamUnavailableError(
          `Personnel directory request timed out after ${timeoutMs}ms.`,
        )
      throw new UpstreamUnavailableError('Personnel directory is unreachable.')
    } finally {
      clearTimeout(timer)
    }
  }
}


/** Refuses an implausibly large directory response instead of truncating it. */
function guardSize<T>(records: T[], what: string): T[] {
  if (records.length > MAX_DIRECTORY_RECORDS) {
    throw new UpstreamUnavailableError(
      `The personnel directory returned ${records.length} ${what}, which is ` +
        `beyond the ${MAX_DIRECTORY_RECORDS} this system will accept in one ` +
        'response. Check that PERSONNEL_DIRECTORY_URL points at the right feed.',
    )
  }
  return records
}
