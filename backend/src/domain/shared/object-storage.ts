// Port for binary object storage. Documents live in MinIO (or any
// S3-compatible store); the domain keeps only a storageKey and the bytes sit
// behind this port.
export interface PutObjectInput {
  key: string
  body: Buffer
  contentType: string
  size?: number
}

/** One stored object as the reconciliation sweep sees it. */
export interface StoredObject {
  key: string
  size: number
  lastModified: Date
}

export interface ListKeysInput {
  prefix?: string
  /** Resume marker: list keys ordered after this one. */
  startAfter?: string
  limit?: number
}

export interface ListKeysResult {
  objects: StoredObject[]
  /** Pass back as startAfter to continue; undefined when the listing is done. */
  nextStartAfter?: string
}

export interface ObjectStorage {
  save(input: PutObjectInput): Promise<void>
  get(key: string): Promise<Buffer>
  getPresignedUrl(key: string, expirySeconds?: number): Promise<string>
  remove(key: string): Promise<void>
  /**
   * Cheapest possible round-trip to the store, for health checks. Resolves if
   * the store answered, throws if it did not. Deliberately returns nothing:
   * a health probe should not be able to read or change a single document.
   */
  ping(): Promise<void>
  /**
   * One page of stored objects. Paginated because a bucket can hold far more
   * keys than fit in memory, and a maintenance sweep must never be the reason
   * the process runs out of it.
   */
  listKeys(input?: ListKeysInput): Promise<ListKeysResult>
}
