"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const entity_1 = require("../shared/entity");
const domain_error_1 = require("../shared/domain-error");
class Role extends entity_1.AggregateRoot {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, name, description) {
        return new Role(id, {
            name,
            description,
            isSystem: false,
            permissionCodes: new Set(),
        });
    }
    static rehydrate(id, props) {
        return new Role(id, props);
    }
    assertMutable() {
        if (this.props.isSystem)
            throw new domain_error_1.InvariantViolationError("Built-in roles are defined by the system and cannot be modified.");
    }
    rename(name, description) {
        this.assertMutable();
        this.props.name = name;
        this.props.description = description;
    }
    grant(code) {
        this.assertMutable();
        this.props.permissionCodes.add(code);
    }
    revoke(code) {
        this.assertMutable();
        this.props.permissionCodes.delete(code);
    }
    softDelete(at = new Date()) {
        this.assertMutable();
        if (this.props.deletedAt)
            return;
        this.props.deletedAt = at;
    }
    has(code) { return this.props.permissionCodes.has(code); }
    get permissions() { return [...this.props.permissionCodes]; }
    get name() { return this.props.name; }
    get description() { return this.props.description; }
    get isSystem() { return this.props.isSystem; }
    get deletedAt() { return this.props.deletedAt; }
    get isRetired() { return this.props.deletedAt !== undefined; }
}
exports.Role = Role;
//# sourceMappingURL=role.js.map