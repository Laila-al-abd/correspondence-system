/**
 * Frontend TypeScript types for the Shared module.
 * Synchronized with backend DTOs and pagination types.
 * Generated from:
 * - backend/src/interface/shared/dto/*.dto.ts
 * - backend/src/application/shared/pagination.ts
 */

// ============================================================================
// DTO Types (matching backend DTOs)
// ============================================================================

/**
 * Query parameters shared by every keyset-paginated list.
 * Matches: backend/src/interface/shared/dto/page-query.dto.ts (PageQueryDto)
 */
export interface PageQueryDto {
  /** Page size (1..200, default 50) */
  limit?: string;

  /** Opaque cursor from previous page's nextCursor */
  cursor?: string;
}

/**
 * Query parameters for offset-paginated lists.
 * Matches: backend/src/interface/shared/dto/page-query.dto.ts (OffsetPageQueryDto)
 */
export interface OffsetPageQueryDto {
  /** Page size (1..200, default 50) */
  limit?: string;

  /** Zero-based offset */
  offset?: string;
}

// ============================================================================
// Pagination Types (matching backend pagination.ts)
// ============================================================================

/**
 * Offset-based pagination page (for lists browsed by page number).
 * Source: backend/src/application/shared/pagination.ts (OffsetPage)
 */
export interface OffsetPage<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Keyset-based pagination page (for stable cursor-based lists).
 * Source: backend/src/application/shared/pagination.ts (KeysetPage)
 */
export interface KeysetPage<T> {
  items: T[];
  limit: number;
  /** Hand this back as `cursor` to get the next page. null means the end. */
  nextCursor: string | null;
}

/**
 * Default page size constant.
 * Source: backend/src/application/shared/pagination.ts (DEFAULT_PAGE_SIZE)
 */
export const DEFAULT_PAGE_SIZE = 50;

/**
 * Maximum page size constant.
 * Source: backend/src/application/shared/pagination.ts (MAX_PAGE_SIZE)
 */
export const MAX_PAGE_SIZE = 200;

// ============================================================================
// Response Types (for API responses)
// ============================================================================

// src/types/shared.ts

/** Mirrors DomainExceptionFilter's ErrorBody on the backend — every error response has this shape. */
export interface ApiErrorBody {
  code: string
  message: string
  traceId: string
  timestamp: string
  path?: string
}

/** Normalized error thrown from the axios response interceptor so call sites never touch error.response.data directly. */
export class ApiError extends Error {
  code: string
  traceId: string
  status: number
  path?: string

  constructor(status: number, body: ApiErrorBody) {
    super(body.message)
    this.name = 'ApiError'
    this.status = status
    this.code = body.code
    this.traceId = body.traceId
    this.path = body.path
  }
}

/**
 * Generic offset-paginated response.
 */
export interface OffsetPaginatedResponse<T> extends OffsetPage<T> {}

/**
 * Generic keyset-paginated response.
 */
export interface KeysetPaginatedResponse<T> extends KeysetPage<T> {}