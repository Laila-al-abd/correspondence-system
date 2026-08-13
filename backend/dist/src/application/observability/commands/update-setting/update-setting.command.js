"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSettingCommand = void 0;
class UpdateSettingCommand {
    key;
    value;
    userId;
    description;
    constructor(key, value, userId, description) {
        this.key = key;
        this.value = value;
        this.userId = userId;
        this.description = description;
    }
}
exports.UpdateSettingCommand = UpdateSettingCommand;
//# sourceMappingURL=update-setting.command.js.map