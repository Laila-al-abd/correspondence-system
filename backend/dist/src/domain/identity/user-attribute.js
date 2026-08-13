"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAttribute = void 0;
const entity_1 = require("../shared/entity");
class UserAttribute extends entity_1.Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, p) {
        return new UserAttribute(id, p);
    }
    static rehydrate(id, props) {
        return new UserAttribute(id, props);
    }
    get userId() { return this.props.userId; }
    get attributeId() { return this.props.attributeId; }
    get value() { return this.props.value; }
    snapshot() {
        return {
            id: this.id.toString(),
            userId: this.props.userId.toString(),
            attributeId: this.props.attributeId.toString(),
            value: this.props.value,
        };
    }
}
exports.UserAttribute = UserAttribute;
//# sourceMappingURL=user-attribute.js.map