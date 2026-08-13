export declare const MAX_DOCUMENT_BYTES: number;
export declare const ALLOWED_MIME_TYPES: readonly ["application/pdf", "image/png", "image/jpeg"];
export declare function assertUploadIsAcceptable(mimeType: string, body: Buffer): void;
