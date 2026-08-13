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
exports.UpdateSettingHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const system_setting_1 = require("../../../../domain/observability/system-setting");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const business_hours_service_1 = require("../../services/business-hours.service");
const setting_keys_1 = require("../../settings/setting-keys");
const update_setting_command_1 = require("./update-setting.command");
let UpdateSettingHandler = class UpdateSettingHandler {
    settings;
    ids;
    businessHours;
    constructor(settings, ids, businessHours) {
        this.settings = settings;
        this.ids = ids;
        this.businessHours = businessHours;
    }
    async execute({ key, value, userId, description, }) {
        const definition = (0, setting_keys_1.settingDefinition)(key);
        definition.validate(value);
        const actor = identifier_1.Identifier.of(userId);
        const existing = await this.settings.findByKey(definition.key);
        let setting;
        if (existing) {
            existing.update(value, actor);
            setting = existing;
        }
        else {
            setting = system_setting_1.SystemSetting.create(this.ids.next(), {
                key: definition.key,
                value,
                description: description ?? definition.description,
                updatedBy: actor,
            });
        }
        await this.settings.save(setting);
        if (definition.invalidatesWorkingHours)
            this.businessHours.invalidate();
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
exports.UpdateSettingHandler = UpdateSettingHandler;
exports.UpdateSettingHandler = UpdateSettingHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_setting_command_1.UpdateSettingCommand),
    __param(0, (0, common_1.Inject)(tokens_1.SYSTEM_SETTING_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __metadata("design:paramtypes", [Object, Object, business_hours_service_1.BusinessHoursService])
], UpdateSettingHandler);
//# sourceMappingURL=update-setting.handler.js.map