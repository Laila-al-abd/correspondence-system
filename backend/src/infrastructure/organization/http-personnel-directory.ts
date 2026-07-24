import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { readFileSync } from 'node:fs'
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

  constructor(private readonly config: ConfigService) {}

  async fetchUnits(): Promise<ExternalOrgUnit[]> {
    const url = this.config.get<string>('PERSONNEL_DIRECTORY_URL')
    if (!url)
      throw new Error(
        'PERSONNEL_DIRECTORY_URL is not configured; cannot sync departments.',
      )

    const mapping = this.loadMapping()
    const payload = await this.get(url)
    return extractRecords(payload, mapping).map((record) =>
      toExternalOrgUnit(record, mapping),
    )
  }

  private loadMapping(): PersonnelDirectoryMapping {
    if (this.mappingCache) return this.mappingCache
    const mappingPath =
      this.config.get<string>('PERSONNEL_DIRECTORY_MAPPING_PATH') ??
      DEFAULT_MAPPING_PATH
    const text = readFileSync(resolve(process.cwd(), mappingPath), 'utf-8')
    this.mappingCache = parseMapping(text)
    return this.mappingCache
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
        throw new Error(
          `Personnel directory responded with HTTP ${response.status}.`,
        )
      return await response.json()
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError')
        throw new Error(
          `Personnel directory request timed out after ${timeoutMs}ms.`,
        )
      throw error
    } finally {
      clearTimeout(timer)
    }
  }
}
