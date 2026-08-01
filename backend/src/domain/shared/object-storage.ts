// Port for binary object storage. Documents live in MinIO (or any
// S3-compatible store); the domain keeps only a storageKey and the bytes sit
// behind this port.
export interface PutObjectInput {
  key: string
  body: Buffer
  contentType: string
  size?: number
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
}
