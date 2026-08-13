"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionType = void 0;
const entity_1 = require("../shared/entity");
class ActionType extends entity_1.Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static rehydrate(id, props) {
        return new ActionType(id, props);
    }
    get code() { return this.props.code; }
    get isTerminal() { return this.props.isTerminal; }
    get name() { return this.props.name; }
}
exports.ActionType = ActionType;
//# sourceMappingURL=action-type.js.map