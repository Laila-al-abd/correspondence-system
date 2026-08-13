"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateRoot = exports.Entity = void 0;
class Entity {
    id;
    constructor(id) {
        this.id = id;
    }
    equals(other) { return !!other && this.id.equals(other.id); }
}
exports.Entity = Entity;
class AggregateRoot extends Entity {
    _events = [];
    raise(event) { this._events.push(event); }
    pullEvents() {
        const e = this._events;
        this.
            _events = [];
        return e;
    }
}
exports.AggregateRoot = AggregateRoot;
//# sourceMappingURL=entity.js.map