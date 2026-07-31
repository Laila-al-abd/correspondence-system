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
   */
  async getPresignedUrl(key: string, expirySeconds = 3600): Promise<string> {
    return this.client.presignedGetObject(this.bucket, key, expirySeconds, {
      'response-content-disposition': 'attachment',
    })
  }

  async remove(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key)
  }
}
