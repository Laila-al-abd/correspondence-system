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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpPersonnelDirectory = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const personnel_directory_mapping_1 = require("./personnel-directory-mapping");
const errors_1 = require("../../application/errors");
const DEFAULT_MAPPING_PATH = 'config/personnel-directory.mapping.yaml';
const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_DIRECTORY_RECORDS = 20_000;
let HttpPersonnelDirectory = class HttpPersonnelDirectory {
    config;
    mappingCache;
    mappingCacheMtimeMs;
    constructor(config) {
        this.config = config;
    }
    async fetchUnits() {
        const url = this.config.get('PERSONNEL_DIRECTORY_URL');
        if (!url)
            throw new errors_1.UpstreamUnavailableError('Personnel directory is not configured (set PERSONNEL_DIRECTORY_URL).');
        const mapping = this.loadMapping();
        const payload = await this.get(url);
        const records = guardSize((0, personnel_directory_mapping_1.extractRecords)(payload, mapping), 'units');
        return records.map((record) => (0, personnel_directory_mapping_1.toExternalOrgUnit)(record, mapping));
    }
    async fetchUsers() {
        const baseUrl = this.config.get('PERSONNEL_DIRECTORY_URL');
        if (!baseUrl)
            throw new errors_1.UpstreamUnavailableError('Personnel directory is not configured (set PERSONNEL_DIRECTORY_URL).');
        const users = this.loadMapping().users;
        if (!users)
            return null;
        const payload = await this.get(this.join(baseUrl, users.endpoint));
        const records = guardSize((0, personnel_directory_mapping_1.extractRecords)(payload, {
            recordsPath: users.recordsPath,
            fields: {
                externalId: users.fields.institutionalNumber,
                nameAr: users.fields.fullNameAr,
                unitType: users.fields.userType,
            },
        }), 'people');
        return records.map((record) => (0, personnel_directory_mapping_1.toExternalUser)(record, users));
    }
    join(baseUrl, endpoint) {
        if (!endpoint)
            return baseUrl;
        return `${baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
    }
    loadMapping() {
        const mappingPath = this.config.get('PERSONNEL_DIRECTORY_MAPPING_PATH') ??
            DEFAULT_MAPPING_PATH;
        const absolutePath = (0, node_path_1.resolve)(process.cwd(), mappingPath);
        const mtimeMs = (0, node_fs_1.statSync)(absolutePath).mtimeMs;
        if (this.mappingCache && this.mappingCacheMtimeMs === mtimeMs)
            return this.mappingCache;
        const text = (0, node_fs_1.readFileSync)(absolutePath, 'utf-8');
        const parsed = (0, personnel_directory_mapping_1.parseMapping)(text);
        this.mappingCache = parsed;
        this.mappingCacheMtimeMs = mtimeMs;
        return parsed;
    }
    async get(url) {
        const timeoutMs = Number(this.config.get('PERSONNEL_DIRECTORY_TIMEOUT_MS')) ||
            DEFAULT_TIMEOUT_MS;
        const apiKey = this.config.get('PERSONNEL_DIRECTORY_API_KEY');
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, {
                headers: {
                    accept: 'application/json',
                    ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
                },
                signal: controller.signal,
            });
            if (!response.ok)
                throw new errors_1.UpstreamUnavailableError(`Personnel directory responded with HTTP ${response.status}.`);
            return await response.json();
        }
        catch (error) {
            if (error instanceof errors_1.UpstreamUnavailableError)
                throw error;
            if (error instanceof Error && error.name === 'AbortError')
                throw new errors_1.UpstreamUnavailableError(`Personnel directory request timed out after ${timeoutMs}ms.`);
            throw new errors_1.UpstreamUnavailableError('Personnel directory is unreachable.');
        }
        finally {
            clearTimeout(timer);
        }
    }
};
exports.HttpPersonnelDirectory = HttpPersonnelDirectory;
exports.HttpPersonnelDirectory = HttpPersonnelDirectory = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HttpPersonnelDirectory);
function guardSize(records, what) {
    if (records.length > MAX_DIRECTORY_RECORDS) {
        throw new errors_1.UpstreamUnavailableError(`The personnel directory returned ${records.length} ${what}, which is ` +
            `beyond the ${MAX_DIRECTORY_RECORDS} this system will accept in one ` +
            'response. Check that PERSONNEL_DIRECTORY_URL points at the right feed.');
    }
    return records;
}
//# sourceMappingURL=http-personnel-directory.js.map