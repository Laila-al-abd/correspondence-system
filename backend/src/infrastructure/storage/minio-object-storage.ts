import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Client } from 'minio'
import {
  ObjectStorage,
  PutObjectInput,
} from '../../domain/shared/object-storage'

/**
 * MinIO (S3-compatible) implementation of the ObjectStorage port. Connection
 * settings come from the environment via ConfigService. The target bucket is
 * created lazily on first write so a fresh deployment works out of the box.
 */
@Injectable()
export class MinioObjectStorage implements ObjectStorage {
  private readonly logger = new Logger(MinioObjectStorage.name)
  private readonly client: Client
  private readonly bucket: string

  constructor(config: ConfigService) {
    this.bucket = config.get<string>('MINIO_BUCKET', 'ics-documents')
    this.client = new Client({
      endPoint: config.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: Number(config.get('MINIO_PORT', 9000)),
      useSSL: config.get<string>('MINIO_USE_SSL', 'false') === 'true',
      // No fallback on purpose: a missing credential must stop the process at
      // startup rather than silently connect with the well-known default
      // account. Endpoint, port, bucket and SSL keep their defaults because
      // they are configuration, not secrets.
      accessKey: config.getOrThrow<string>('MINIO_ACCESS_KEY'),
      secretKey: config.getOrThrow<string>('MINIO_SECRET_KEY'),
    })
  }

  /** Create the bucket on first use if it does not exist yet. */
  private async ensureBucket(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket)
    if (!exists) {
      await this.client.makeBucket(this.bucket)
      this.logger.log(`Created object-storage bucket "${this.bucket}"`)
    }
  }

  async save(input: PutObjectInput): Promise<void> {
    await this.ensureBucket()
    const size = input.size ?? input.body.length
    await this.client.putObject(this.bucket, input.key, input.body, size, {
      'Content-Type': input.contentType,
    })
  }

  async get(key: string): Promise<Buffer> {
    const stream = await this.client.getObject(this.bucket, key)
    const chunks: Buffer[] = []
    return new Promise<Buffer>((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk))
      stream.on('end', () => resolve(Buffer.concat(chunks)))
      stream.on('error', reject)
    })
  }

  /**
   * A time-limited download link. The response headers force the browser to
   * download the file instead of rendering it, so a stored HTML or SVG file
   * can never execute in the user's session against this origin.
   *
   * The default window is one minute, not one hour. A presigned URL carries its
   * own authority: whoever holds the string can fetch the object, with no token,
   * no session, and no further check against this API. An hour is long enough
   * for that string to be pasted into a chat, forwarded in an email, or left in
   * a browser history, and for a document the sender is no longer allowed to
   * see to be read by someone who never was. A minute is comfortably longer than
   * the time between clicking a link and the download starting, and short enough
   * that a leaked URL is almost always already dead.
   *
   * This is why links are minted at click time rather than embedded in list
   * responses — see the download-url endpoint.
   */
  async getPresignedUrl(key: string, expirySeconds = 60): Promise<string> {
    return this.client.presignedGetObject(this.bucket, key, expirySeconds, {
      'response-content-disposition': 'attachment',
    })
  }

  /**
   * Asks whether the configured bucket exists. This touches the network and the
   * credentials without listing, reading, or writing any object, so a failure
   * means the store is genuinely unreachable or the credentials are wrong,
   * which is exactly what a health check should distinguish.
   */
  async ping(): Promise<void> {
    await this.client.bucketExists(this.bucket)
  }

  async remove(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key)
  }
}
