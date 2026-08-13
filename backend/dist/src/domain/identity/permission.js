"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = void 0;
const entity_1 = require("../shared/entity");
class Permission extends entity_1.Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static rehydrate(id, props) {
        return new Permission(id, props);
    }
    get code() { return this.props.code; }
    get name() { return this.props.name; }
    get description() { return this.props.description; }
    get groupId() { return this.props.groupId; }
}
exports.Permission = Permission;
//# sourceMappingURL=permission.js.map