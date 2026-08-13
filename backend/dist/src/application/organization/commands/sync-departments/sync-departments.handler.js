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
exports.SyncDepartmentsHandler = void 0;
const config_1 = require("@nestjs/config");
const cqrs_1 = require("@nestjs/cqrs");
const sync_departments_from_directory_1 = require("../../sync-departments-from-directory");
const sync_departments_command_1 = require("./sync-departments.command");
const DEFAULT_SOURCE = 'personnel-directory';
let SyncDepartmentsHandler = class SyncDepartmentsHandler {
    sync;
    config;
    constructor(sync, config) {
        this.sync = sync;
        this.config = config;
    }
    execute({ source }) {
        const resolved = source ??
            this.config.get('PERSONNEL_DIRECTORY_SOURCE') ??
            DEFAULT_SOURCE;
        return this.sync.execute(resolved);
    }
};
exports.SyncDepartmentsHandler = SyncDepartmentsHandler;
exports.SyncDepartmentsHandler = SyncDepartmentsHandler = __decorate([
    (0, cqrs_1.CommandHandler)(sync_departments_command_1.SyncDepartmentsCommand),
    __metadata("design:paramtypes", [sync_departments_from_directory_1.SyncDepartmentsFromDirectory,
        config_1.ConfigService])
], SyncDepartmentsHandler);
//# sourceMappingURL=sync-departments.handler.js.map