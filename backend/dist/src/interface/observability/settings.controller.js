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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cqrs_1 = require("@nestjs/cqrs");
const setting_keys_1 = require("../../application/observability/settings/setting-keys");
const get_setting_query_1 = require("../../application/observability/queries/get-setting/get-setting.query");
const update_setting_command_1 = require("../../application/observability/commands/update-setting/update-setting.command");
const current_user_decorator_1 = require("../identity/current-user.decorator");
const permissions_decorator_1 = require("../identity/permissions.decorator");
const update_setting_dto_1 = require("./dto/update-setting.dto");
let SettingsController = class SettingsController {
    commandBus;
    queryBus;
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    listKeys() {
        return setting_keys_1.SETTING_DEFINITIONS.map(({ key, description }) => ({
            key,
            description,
        }));
    }
    getOne(key) {
        return this.queryBus.execute(new get_setting_query_1.GetSettingQuery(key));
    }
    update(key, dto, userId) {
        return this.commandBus.execute(new update_setting_command_1.UpdateSettingCommand(key, dto.value, userId, dto.description));
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('system.monitor'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], SettingsController.prototype, "listKeys", null);
__decorate([
    (0, common_1.Get)(':key'),
    (0, permissions_decorator_1.RequirePermissions)('system.monitor'),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Put)(':key'),
    (0, permissions_decorator_1.RequirePermissions)('system.monitor'),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_setting_dto_1.UpdateSettingDto, String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "update", null);
exports.SettingsController = SettingsController = __decorate([
    (0, swagger_1.ApiTags)('settings'),
    (0, common_1.Controller)('settings'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map