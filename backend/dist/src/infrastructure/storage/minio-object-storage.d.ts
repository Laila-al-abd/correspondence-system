import { ConfigService } from '@nestjs/config';
import { ListKeysInput, ListKeysResult, ObjectStorage, PutObjectInput } from '../../domain/shared/object-storage';
export declare class MinioObjectStorage implements ObjectStorage {
    private readonly logger;
    private readonly client;
    private readonly bucket;
    constructor(config: ConfigService);
    private ensureBucket;
    save(input: PutObjectInput): Promise<void>;
    get(key: string): Promise<Buffer>;
    getPresignedUrl(key: string, expirySeconds?: number): Promise<string>;
    ping(): Promise<void>;
    remove(key: string): Promise<void>;
    listKeys(input?: ListKeysInput): Promise<ListKeysResult>;
}
