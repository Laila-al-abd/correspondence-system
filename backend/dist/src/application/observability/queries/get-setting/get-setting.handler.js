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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSettingHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const tokens_1 = require("../../../tokens");
const setting_keys_1 = require("../../settings/setting-keys");
const get_setting_query_1 = require("./get-setting.query");
let GetSettingHandler = class GetSettingHandler {
    settings;
    constructor(settings) {
        this.settings = settings;
    }
    async execute({ key }) {
        const definition = (0, setting_keys_1.settingDefinition)(key);
        const setting = await this.settings.findByKey(definition.key);
        if (!setting)
            return {
                key: definition.key,
                value: definition.defaultValue,
                description: definition.description,
                configured: false,
            };
        const snapshot = setting.snapshot();
        return {
            key: definition.key,
            value: snapshot.value,
            description: snapshot.description ?? definition.description,
            configured: true,
            updatedAt: snapshot.updatedAt.toISOString(),
            updatedBy: snapshot.updatedBy,
        };
    }
};
exports.GetSettingHandler = GetSettingHandler;
exports.GetSettingHandler = GetSettingHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_setting_query_1.GetSettingQuery),
    __param(0, (0, common_1.Inject)(tokens_1.SYSTEM_SETTING_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], GetSettingHandler);
//# sourceMappingURL=get-setting.handler.js.map