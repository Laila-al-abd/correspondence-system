export interface UploadDocumentInput {
  requestId: string
  uploaderId: string
  fileName: string
  mimeType: string
  contentBase64: string
  docKind?: string
  requestActionId?: string
  ocrText?: string
}

export class UploadDocumentCommand {
  constructor(public readonly input: UploadDocumentInput) {}
}
