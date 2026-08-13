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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var StorageReconciliationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageReconciliationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const tokens_1 = require("../../application/tokens");
const MS_PER_HOUR = 60 * 60 * 1000;
const DEFAULT_GRACE_HOURS = 24;
const DEFAULT_SWEEP_HOURS = 24;
const PAGE_SIZE = 1000;
const MAX_PAGES = 1000;
const STARTUP_DELAY_MS = 30_000;
const SAMPLE_LIMIT = 20;
let StorageReconciliationService = StorageReconciliationService_1 = class StorageReconciliationService {
    storage;
    documents;
    config;
    logger = new common_1.Logger(StorageReconciliationService_1.name);
    startupTimer;
    sweepTimer;
    running = false;
    constructor(storage, documents, config) {
        this.storage = storage;
        this.documents = documents;
        this.config = config;
    }
    onModuleInit() {
        if (this.config.get('STORAGE_RECONCILIATION_ENABLED') === 'false') {
            this.logger.log('Storage reconciliation disabled by configuration.');
            return;
        }
        const sweepHours = this.readPositiveNumber('STORAGE_RECONCILIATION_SWEEP_HOURS', DEFAULT_SWEEP_HOURS);
        this.startupTimer = setTimeout(() => {
            void this.safeSweep();
        }, STARTUP_DELAY_MS);
        this.startupTimer.unref?.();
        this.sweepTimer = setInterval(() => {
            void this.safeSweep();
        }, sweepHours * MS_PER_HOUR);
        this.sweepTimer.unref?.();
        this.logger.log(`Storage reconciliation active: report-only, ${this.graceHours()}h grace, sweeping every ${sweepHours}h.`);
    }
    onModuleDestroy() {
        if (this.startupTimer)
            clearTimeout(this.startupTimer);
        if (this.sweepTimer)
            clearInterval(this.sweepTimer);
    }
    async safeSweep() {
        if (this.running) {
            this.logger.warn('Skipping sweep: the previous one is still running.');
            return;
        }
        try {
            await this.sweep();
        }
        catch (error) {
            this.logger.warn(`Storage reconciliation sweep failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async sweep() {
        if (this.running)
            throw new Error('A reconciliation sweep is already running.');
        this.running = true;
        const startedAt = new Date();
        try {
            const cutoff = new Date(startedAt.getTime() - this.graceHours() * MS_PER_HOUR);
            let startAfter;
            let examined = 0;
            let withinGrace = 0;
            let orphans = 0;
            let orphanBytes = 0;
            let pages = 0;
            let truncated = false;
            const sample = [];
            for (;;) {
                const page = await this.storage.listKeys({
                    startAfter,
                    limit: PAGE_SIZE,
                });
                if (page.objects.length === 0)
                    break;
                pages += 1;
                const settled = page.objects.filter((object) => {
                    const old = object.lastModified.getTime() <= cutoff.getTime();
                    if (!old)
                        withinGrace += 1;
                    return old;
                });
                examined += settled.length;
                if (settled.length > 0) {
                    const known = await this.documents.findExistingStorageKeys(settled.map((object) => object.key));
                    for (const object of settled) {
                        if (known.has(object.key))
                            continue;
                        orphans += 1;
                        orphanBytes += object.size;
                        if (sample.length < SAMPLE_LIMIT)
                            sample.push({
                                key: object.key,
                                size: object.size,
                                lastModified: object.lastModified.toISOString(),
                            });
                    }
                }
                if (!page.nextStartAfter)
                    break;
                startAfter = page.nextStartAfter;
                if (pages >= MAX_PAGES) {
                    truncated = true;
                    this.logger.warn(`Storage reconciliation stopped after ${MAX_PAGES} pages; the bucket is larger than one sweep handles.`);
                    break;
                }
            }
            const finishedAt = new Date();
            this.logger.log([
                'storage reconciliation',
                'mode=report-only',
                `examined=${examined}`,
                `withinGrace=${withinGrace}`,
                `orphans=${orphans}`,
                `orphanBytes=${orphanBytes}`,
                `graceHours=${this.graceHours()}`,
                `truncated=${truncated}`,
                `durationMs=${finishedAt.getTime() - startedAt.getTime()}`,
                `at=${finishedAt.toISOString()}`,
            ].join(' '));
            return {
                startedAt: startedAt.toISOString(),
                finishedAt: finishedAt.toISOString(),
                examined,
                withinGrace,
                orphans,
                orphanBytes,
                sample,
                truncated,
            };
        }
        finally {
            this.running = false;
        }
    }
    graceHours() {
        return this.readPositiveNumber('STORAGE_RECONCILIATION_GRACE_HOURS', DEFAULT_GRACE_HOURS);
    }
    readPositiveNumber(key, fallback) {
        const raw = this.config.get(key);
        const value = raw === undefined ? Number.NaN : Number(raw);
        return Number.isFinite(value) && value > 0 ? value : fallback;
    }
};
exports.StorageReconciliationService = StorageReconciliationService;
exports.StorageReconciliationService = StorageReconciliationService = StorageReconciliationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tokens_1.OBJECT_STORAGE)),
    __param(1, (0, common_1.Inject)(tokens_1.DOCUMENT_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, config_1.ConfigService])
], StorageReconciliationService);
//# sourceMappingURL=storage-reconciliation.service.js.map