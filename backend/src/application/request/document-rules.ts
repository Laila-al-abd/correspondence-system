import { InvariantViolationError } from '../../domain/shared/domain-error'

/**
 * Upload rules for attached documents.
 *
 * Two independent checks, because either one alone is easy to defeat:
 *
 *   1. The declared MIME type must be on the allow-list. This is what the
 *      client *claims* the file is, and a client can claim anything.
 *   2. The first bytes of the file must match that claim. Every real format
 *      starts with a fixed marker ("magic bytes"), so a script renamed to
 *      report.pdf is rejected here even though its declared type looked fine.
 *
 * Deliberately hand-written: three formats need three short comparisons, and
 * a file-type library would be a new dependency for no extra safety.
 */

/** 10 MB, measured on the decoded bytes rather than the base64 payload. */
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024

/** The only formats the correspondence system accepts as attachments. */
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
] as const

type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number]

/** Leading bytes that identify each allowed format. */
const SIGNATURES: Record<AllowedMimeType, number[][]> = {
  // "%PDF"
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
  // 0x89 "PNG"
  'image/png': [[0x89, 0x50, 0x4e, 0x47]],
  // JPEG start-of-image marker, common to JFIF and Exif files
  'image/jpeg': [[0xff, 0xd8, 0xff]],
}

function startsWith(body: Buffer, signature: number[]): boolean {
  if (body.length < signature.length) return false
  return signature.every((byte, index) => body[index] === byte)
}

/**
 * Throws InvariantViolationError (HTTP 400) when the file is too large, of an
 * unsupported type, or when its contents contradict the declared type.
 */
export function assertUploadIsAcceptable(
  mimeType: string,
  body: Buffer,
): void {
  if (body.length === 0) {
    throw new InvariantViolationError('The uploaded file is empty.')
  }

  if (body.length > MAX_DOCUMENT_BYTES) {
    const limitMb = Math.round(MAX_DOCUMENT_BYTES / (1024 * 1024))
    throw new InvariantViolationError(
      `The uploaded file exceeds the ${limitMb} MB limit.`,
    )
  }

  const declared = mimeType.split(';')[0].trim().toLowerCase()
  if (!ALLOWED_MIME_TYPES.includes(declared as AllowedMimeType)) {
    throw new InvariantViolationError(
      `Unsupported file type "${mimeType}". Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}.`,
    )
  }

  const signatures = SIGNATURES[declared as AllowedMimeType]
  if (!signatures.some((signature) => startsWith(body, signature))) {
    throw new InvariantViolationError(
      `The file contents do not match the declared type "${declared}".`,
    )
  }
}
