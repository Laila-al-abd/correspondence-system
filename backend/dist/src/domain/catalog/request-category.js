"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestCategory = void 0;
const entity_1 = require("../shared/entity");
class RequestCategory extends entity_1.Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, name, description) {
        return new RequestCategory(id, { name, description });
    }
    static rehydrate(id, props) {
        return new RequestCategory(id, props);
    }
    get name() { return this.props.name; }
}
exports.RequestCategory = RequestCategory;
//# sourceMappingURL=request-category.js.map