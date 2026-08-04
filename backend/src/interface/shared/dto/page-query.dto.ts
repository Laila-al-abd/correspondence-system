import { IsNumberString, IsOptional, IsString, Length } from 'class-validator'

/**
 * Query parameters shared by every keyset-paginated list.
 *
 * `limit` arrives as a string because query strings are strings; it is parsed
 * at the controller edge and clamped in the query layer, so an absurd or
 * missing value can never reach the database as-is.
 *
 * `cursor` is opaque. Clients receive it in `nextCursor` and hand it straight
 * back; they must not build one. Keeping it opaque is what lets the ordering
 * key change later without breaking every caller.
 */
export class PageQueryDto {
  @IsOptional()
  @IsNumberString()
  limit?: string

  @IsOptional()
  @IsString()
  @Length(1, 512)
  cursor?: string
}

/** Parameters for offset-paginated lists, which browse by page number. */
export class OffsetPageQueryDto {
  @IsOptional()
  @IsNumberString()
  limit?: string

  @IsOptional()
  @IsNumberString()
  offset?: string
}

/** Parses an optional numeric query parameter without turning '' into 0. */
export function toNumber(raw?: string): number | undefined {
  if (raw === undefined || raw === '') return undefined
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : undefined
}
