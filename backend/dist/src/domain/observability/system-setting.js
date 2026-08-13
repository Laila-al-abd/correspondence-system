"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSetting = void 0;
const entity_1 = require("../shared/entity");
const guard_1 = require("../shared/guard");
class SystemSetting extends entity_1.AggregateRoot {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, p) {
        guard_1.Guard.againstEmpty(p.key, "key");
        return new SystemSetting(id, { ...p, updatedAt: new Date() });
    }
    static rehydrate(id, props) {
        return new SystemSetting(id, props);
    }
    snapshot() {
        return {
            key: this.props.key,
            value: this.props.value,
            description: this.props.description,
            updatedBy: this.props.updatedBy?.toString(),
            updatedAt: this.props.updatedAt,
        };
    }
    update(value, updatedBy) {
        this.props.value = value;
        this.props.updatedBy = updatedBy;
        this.props.updatedAt = new Date();
    }
    get key() { return this.props.key; }
    get value() { return this.props.value; }
}
exports.SystemSetting = SystemSetting;
//# sourceMappingURL=system-setting.js.map