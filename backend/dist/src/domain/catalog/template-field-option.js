"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateFieldOption = void 0;
const value_object_1 = require("../shared/value-object");
const guard_1 = require("../shared/guard");
class TemplateFieldOption extends value_object_1.ValueObject {
    constructor(props) {
        super(props);
    }
    static create(value, label, ordinal = 0) {
        return new TemplateFieldOption({
            value: guard_1.Guard.againstEmpty(value, "option value"),
            label,
            ordinal,
        });
    }
    get value() { return this.props.value; }
    get label() { return this.props.label; }
    get ordinal() { return this.props.ordinal; }
}
exports.TemplateFieldOption = TemplateFieldOption;
//# sourceMappingURL=template-field-option.js.map