import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import type {
  ExternalOrgUnit,
  PersonnelDirectory,
} from '../../domain/organization/ports/department.repository'
import {
  PersonnelDirectoryMapping,
  extractRecords,
  parseMapping,
  toExternalOrgUnit,
} from './personnel-directory-mapping'
import { UpstreamUnavailableError } from '../../application/errors'

const DEFAULT_MAPPING_PATH = 'config/personnel-directory.mapping.yaml'
const DEFAULT_TIMEOUT_MS = 10_000

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
    return extractRecords(payload, mapping).map((record) =>
      toExternalOrgUnit(record, mapping),
    )
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
