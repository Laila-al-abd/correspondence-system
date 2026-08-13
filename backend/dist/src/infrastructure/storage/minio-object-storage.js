"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MinioObjectStorage_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinioObjectStorage = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const minio_1 = require("minio");
let MinioObjectStorage = MinioObjectStorage_1 = class MinioObjectStorage {
    logger = new common_1.Logger(MinioObjectStorage_1.name);
    client;
    bucket;
    constructor(config) {
        this.bucket = config.get('MINIO_BUCKET', 'ics-documents');
        this.client = new minio_1.Client({
            endPoint: config.get('MINIO_ENDPOINT', 'localhost'),
            port: Number(config.get('MINIO_PORT', 9000)),
            useSSL: config.get('MINIO_USE_SSL', 'false') === 'true',
            accessKey: config.getOrThrow('MINIO_ACCESS_KEY'),
            secretKey: config.getOrThrow('MINIO_SECRET_KEY'),
        });
    }
    async ensureBucket() {
        const exists = await this.client.bucketExists(this.bucket);
        if (!exists) {
            await this.client.makeBucket(this.bucket);
            this.logger.log(`Created object-storage bucket "${this.bucket}"`);
        }
    }
    async save(input) {
        await this.ensureBucket();
        const size = input.size ?? input.body.length;
        await this.client.putObject(this.bucket, input.key, input.body, size, {
            'Content-Type': input.contentType,
        });
    }
    async get(key) {
        const stream = await this.client.getObject(this.bucket, key);
        const chunks = [];
        return new Promise((resolve, reject) => {
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
        });
    }
    async getPresignedUrl(key, expirySeconds = 60) {
        return this.client.presignedGetObject(this.bucket, key, expirySeconds, {
            'response-content-disposition': 'attachment',
        });
    }
    async ping() {
        await this.client.bucketExists(this.bucket);
    }
    async remove(key) {
        await this.client.removeObject(this.bucket, key);
    }
    async listKeys(input = {}) {
        const limit = input.limit && input.limit > 0 ? input.limit : 1000;
        const objects = [];
        return new Promise((resolve, reject) => {
            const stream = this.client.listObjectsV2(this.bucket, input.prefix ?? '', true, input.startAfter ?? '');
            let settled = false;
            const finish = () => {
                if (settled)
                    return;
                settled = true;
                const full = objects.length >= limit;
                resolve({
                    objects,
                    nextStartAfter: full ? objects[objects.length - 1].key : undefined,
                });
            };
            stream.on('data', (item) => {
                if (settled)
                    return;
                if (!item.name)
                    return;
                objects.push({
                    key: item.name,
                    size: item.size ?? 0,
                    lastModified: item.lastModified ?? new Date(0),
                });
                if (objects.length >= limit) {
                    stream.destroy();
                    finish();
                }
            });
            stream.on('end', finish);
            stream.on('close', finish);
            stream.on('error', (error) => {
                if (settled)
                    return;
                settled = true;
                reject(error);
            });
        });
    }
};
exports.MinioObjectStorage = MinioObjectStorage;
exports.MinioObjectStorage = MinioObjectStorage = MinioObjectStorage_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MinioObjectStorage);
//# sourceMappingURL=minio-object-storage.js.map