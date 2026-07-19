import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { Guard } from "../shared/guard"
import { InvariantViolationError } from "../shared/domain-error"
import { DocKind } from "./enums"

interface DocumentProps {
  requestId: Identifier
  requestActionId?: Identifier
  uploaderId: Identifier
  docKind: DocKind
  storageKey: string
  fileName: string
  mimeType: string
  fileSize: number
  ocrText?: string
  uploadedAt: Date
}

/** A file tied to a request: uploaded evidence or a generated document. */
export class Document extends Entity {
  private constructor(id: Identifier, private props: DocumentProps) {
    super(id)
  }

  static create(
    id: Identifier,
    p: {
      requestId: Identifier
      uploaderId: Identifier
      docKind: DocKind
      storageKey: string
      fileName: string
      mimeType: string
      fileSize: number
      requestActionId?: Identifier
      ocrText?: string
    },
  ): Document {
    Guard.againstEmpty(p.storageKey, "storageKey")
    Guard.againstEmpty(p.fileName, "fileName")
    if (p.fileSize < 0) throw new InvariantViolationError("fileSize cannot be negative.")
    return new Document(id, { ...p, uploadedAt: new Date() })
  }

  static rehydrate(id: Identifier, props: DocumentProps): Document {
    return new Document(id, props)
  }

  /** Attach OCR text extracted by the ingestion pipeline. */
  attachOcr(text: string): void { this.props.ocrText = text }

  get storageKey(): string { return this.props.storageKey }
  get docKind(): DocKind { return this.props.docKind }
}
