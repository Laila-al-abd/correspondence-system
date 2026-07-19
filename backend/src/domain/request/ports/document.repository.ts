import { Identifier } from "../../shared/identifier"
import { Document } from "../document"

// Document is a plain entity owned by a request, so it gets a focused port
// rather than extending the aggregate Repository base.
export interface DocumentRepository {
  findById(id: Identifier): Promise<Document | null>
  save(document: Document): Promise<void>
  listByRequest(requestId: Identifier): Promise<Document[]>
}
