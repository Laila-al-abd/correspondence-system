"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeDefinition = void 0;
const entity_1 = require("../shared/entity");
const domain_error_1 = require("../shared/domain-error");
const enums_1 = require("./enums");
class AttributeDefinition extends entity_1.Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, p) {
        return new AttributeDefinition(id, {
            ...p,
            options: assertOptionSet(p.code, p.dataType, p.options),
        });
    }
    static rehydrate(id, props) {
        return new AttributeDefinition(id, { ...props, options: props.options ?? [] });
    }
    get code() { return this.props.code; }
    get dataType() { return this.props.dataType; }
    get options() { return this.props.options ?? []; }
    validate(value) {
        if (this.props.dataType === enums_1.AttributeDataType.ENUM) {
            const allowed = this.options.map((o) => o.value);
            return allowed.includes(String(value))
                ? null
                : `Expected one of: ${allowed.join(', ')}.`;
        }
        return null;
    }
    snapshot() {
        return {
            id: this.id.toString(),
            code: this.props.code,
            label: this.props.label.toJSON(),
            dataType: this.props.dataType,
            description: this.props.description?.toJSON(),
            options: this.options.map((o) => ({
                value: o.value,
                label: o.label.toJSON(),
                ordinal: o.ordinal,
            })),
        };
    }
}
exports.AttributeDefinition = AttributeDefinition;
function assertOptionSet(code, dataType, options) {
    const set = options ?? [];
    if (dataType === enums_1.AttributeDataType.ENUM) {
        if (set.length === 0)
            throw new domain_error_1.InvariantViolationError(`ENUM attribute "${code}" must define at least one option.`);
        const values = set.map((o) => o.value);
        if (new Set(values).size !== values.length)
            throw new domain_error_1.InvariantViolationError(`Duplicate option value in attribute "${code}".`);
    }
    else if (set.length > 0) {
        throw new domain_error_1.InvariantViolationError(`Only ENUM attributes may define options (attribute "${code}").`);
    }
    return set;
}
//# sourceMappingURL=attribute-definition.js.map