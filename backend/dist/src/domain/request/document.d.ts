import { Entity } from "../shared/entity";
import { Identifier } from "../shared/identifier";
import { DocKind } from "./enums";
interface DocumentProps {
    requestId: Identifier;
    requestActionId?: Identifier;
    uploaderId: Identifier;
    docKind: DocKind;
    storageKey: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    ocrText?: string;
    uploadedAt: Date;
}
export interface DocumentSnapshot {
    requestId: string;
    requestActionId?: string;
    uploaderId: string;
    docKind: DocKind;
    storageKey: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    ocrText?: string;
    uploadedAt: Date;
}
export declare class Document extends Entity {
    private props;
    private constructor();
    static create(id: Identifier, p: {
        requestId: Identifier;
        uploaderId: Identifier;
        docKind: DocKind;
        storageKey: string;
        fileName: string;
        mimeType: string;
        fileSize: number;
        requestActionId?: Identifier;
        ocrText?: string;
    }): Document;
    static rehydrate(id: Identifier, props: DocumentProps): Document;
    attachOcr(text: string): void;
    get storageKey(): string;
    get docKind(): DocKind;
    get requestId(): Identifier;
    get fileName(): string;
    snapshot(): DocumentSnapshot;
}
export {};
