"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeOption = void 0;
const entity_1 = require("../shared/entity");
class AttributeOption extends entity_1.Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, p) {
        return new AttributeOption(id, p);
    }
    static rehydrate(id, props) {
        return new AttributeOption(id, props);
    }
    get value() { return this.props.value; }
    get label() { return this.props.label; }
    get ordinal() { return this.props.ordinal; }
}
exports.AttributeOption = AttributeOption;
//# sourceMappingURL=attribute-option.js.map