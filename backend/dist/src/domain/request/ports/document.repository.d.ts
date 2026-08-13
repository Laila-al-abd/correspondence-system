import { Identifier } from "../../shared/identifier";
import { Document } from "../document";
export interface DocumentRepository {
    findById(id: Identifier): Promise<Document | null>;
    save(document: Document): Promise<void>;
    listByRequest(requestId: Identifier): Promise<Document[]>;
    findExistingStorageKeys(keys: string[]): Promise<Set<string>>;
}
