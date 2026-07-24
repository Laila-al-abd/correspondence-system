import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Document } from '../../../../domain/request/document'
import { DocKind } from '../../../../domain/request/enums'
import { Identifier } from '../../../../domain/shared/identifier'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import type { DocumentRepository } from '../../../../domain/request/ports/document.repository'
import type { ObjectStorage } from '../../../../domain/shared/object-storage'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import {
  DOCUMENT_REPOSITORY,
  ID_GENERATOR,
  OBJECT_STORAGE,
  REQUEST_REPOSITORY,
} from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { UploadDocumentCommand } from './upload-document.command'

export interface UploadDocumentResult {
  id: string
  storageKey: string
}

/**
 * Stores an uploaded file: the bytes go to object storage (MinIO) and only the
 * metadata plus the storage key are persisted, so the database stays lean.
 */
@CommandHandler(UploadDocumentCommand)
export class UploadDocumentHandler
  implements ICommandHandler<UploadDocumentCommand, UploadDocumentResult>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
    @Inject(DOCUMENT_REPOSITORY) private readonly documents: DocumentRepository,
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStorage,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
  ) {}

  async execute({
    input,
  }: UploadDocumentCommand): Promise<UploadDocumentResult> {
    const requestId = Identifier.of(input.requestId)
    const request = await this.requests.findById(requestId)
    if (!request) throw new EntityNotFoundError('Request', input.requestId)

    const id = this.ids.next()
    const body = Buffer.from(input.contentBase64, 'base64')
    const storageKey = `requests/${input.requestId}/${id.toString()}/${input.fileName}`

    await this.storage.save({
      key: storageKey,
      body,
      contentType: input.mimeType,
      size: body.length,
    })

    const document = Document.create(id, {
      requestId,
      uploaderId: Identifier.of(input.uploaderId),
      docKind: input.docKind ? (input.docKind as DocKind) : DocKind.UPLOADED,
      storageKey,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSize: body.length,
      requestActionId: input.requestActionId
        ? Identifier.of(input.requestActionId)
        : undefined,
      ocrText: input.ocrText,
    })
    await this.documents.save(document)
    return { id: id.toString(), storageKey }
  }
}
