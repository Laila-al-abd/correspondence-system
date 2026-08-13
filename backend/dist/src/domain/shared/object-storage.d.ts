export interface PutObjectInput {
    key: string;
    body: Buffer;
    contentType: string;
    size?: number;
}
export interface StoredObject {
    key: string;
    size: number;
    lastModified: Date;
}
export interface ListKeysInput {
    prefix?: string;
    startAfter?: string;
    limit?: number;
}
export interface ListKeysResult {
    objects: StoredObject[];
    nextStartAfter?: string;
}
export interface ObjectStorage {
    save(input: PutObjectInput): Promise<void>;
    get(key: string): Promise<Buffer>;
    getPresignedUrl(key: string, expirySeconds?: number): Promise<string>;
    remove(key: string): Promise<void>;
    ping(): Promise<void>;
    listKeys(input?: ListKeysInput): Promise<ListKeysResult>;
}
