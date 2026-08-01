import { Inject, Logger } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { DocumentRepository } from '../../../../domain/request/ports/document.repository'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import type { RoleRepository } from '../../../../domain/identity/ports/role.repository'
import type { ObjectStorage } from '../../../../domain/shared/object-storage'
import { Identifier } from '../../../../domain/shared/identifier'
import {
  DOCUMENT_REPOSITORY,
  OBJECT_STORAGE,
  REQUEST_REPOSITORY,
  ROLE_REPOSITORY,
} from '../../../tokens'
import { EntityNotFoundError, ForbiddenActionError } from '../../../errors'
import { GetDocumentDownloadUrlQuery } from './get-document-download-url.query'

/**
 * How long an issued link lives. Passed explicitly rather than relying on the
 * adapter default so the number is visible at the place that has to justify it.
 */
const LINK_TTL_SECONDS = 60

export interface DocumentDownloadUrlView {
  url: string
  fileName: string
  expiresInSeconds: number
  expiresAt: string
}

/**
 * Issues a presigned download link for a single document, at the moment the
 * user asks for it.
 *
 * Minting at click time is the whole design. The obvious alternative -- putting
 * a URL on every document in the request detail response -- issues links for
 * files nobody opens, writes them into any log or cache that holds the
 * response, and makes the link's lifetime start when the page was loaded rather
 * than when the user acted. One request, one link, one minute.
 *
 * A presigned URL carries its own authority: whoever holds the string can fetch
 * the object without a token and without touching this API again. That makes
 * this handler the last place authorization can happen, so it happens here in
 * full rather than being inferred from the caller having reached the route.
 *
 * Every issued link is logged. An object store access log shows that a file was
 * fetched but not who asked for the link, and the two cannot be joined after
 * the fact -- the presigned URL is anonymous by construction. This line is the
 * only record connecting a person to a document, which is exactly what an
 * investigation into a leaked file needs.
 */
@QueryHandler(GetDocumentDownloadUrlQuery)
export class GetDocumentDownloadUrlHandler
  implements IQueryHandler<GetDocumentDownloadUrlQuery, DocumentDownloadUrlView>
{
  private readonly logger = new Logger(GetDocumentDownloadUrlHandler.name)

  constructor(
    @Inject(DOCUMENT_REPOSITORY) private readonly documents: DocumentRepository,
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStorage,
  ) {}

  async execute(
    query: GetDocumentDownloadUrlQuery,
  ): Promise<DocumentDownloadUrlView> {
    const document = await this.documents.findById(
      Identifier.of(query.documentId),
    )
    if (!document)
      throw new EntityNotFoundError('Document', query.documentId)

    // The document must belong to the request in the URL. Reported as "not
    // found" rather than "forbidden" on purpose: answering 403 here would
    // confirm that a document with that id exists somewhere in the system.
    if (document.requestId.toString() !== query.requestId)
      throw new EntityNotFoundError('Document', query.documentId)

    const request = await this.requests.findById(
      Identifier.of(query.requestId),
    )
    if (!request) throw new EntityNotFoundError('Request', query.requestId)

    await this.assertMayRead(query.requestedBy, request.requesterId.toString())

    const url = await this.storage.getPresignedUrl(
      document.storageKey,
      LINK_TTL_SECONDS,
    )

    const expiresAt = new Date(Date.now() + LINK_TTL_SECONDS * 1000)
    this.logger.log(
      [
        'document link issued',
        `userId=${query.requestedBy}`,
        `requestId=${query.requestId}`,
        `documentId=${query.documentId}`,
        `ttlSeconds=${LINK_TTL_SECONDS}`,
        `at=${new Date().toISOString()}`,
      ].join(' '),
    )

    return {
      url,
      fileName: document.fileName,
      expiresInSeconds: LINK_TTL_SECONDS,
      expiresAt: expiresAt.toISOString(),
    }
  }

  /**
   * Either you filed the request, or you are staff who may read requests.
   *
   * The ownership branch is why this route carries no @RequirePermissions
   * decorator: an applicant holds no permissions at all, and requiring
   * `request.read` would mean people cannot download the documents they
   * themselves attached. The consequence is that this route is not covered by
   * WorkingHoursGuard's network allow-list, which keys off declared
   * permissions -- accepted deliberately, because an applicant downloading
   * their own receipt from home is a use case the system exists to serve, and
   * reading is not a time-boxed privilege in this design either way.
   */
  private async assertMayRead(
    callerId: string,
    requesterId: string,
  ): Promise<void> {
    if (callerId === requesterId) return

    const permissions = await this.roles.effectivePermissions(
      Identifier.of(callerId),
    )
    if (!permissions.has('request.read'))
      throw new ForbiddenActionError(
        'You may only download documents on your own requests.',
      )
  }
}
