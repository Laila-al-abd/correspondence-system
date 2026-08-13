"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Department = void 0;
const entity_1 = require("../shared/entity");
const domain_error_1 = require("../shared/domain-error");
class Department extends entity_1.AggregateRoot {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, p) {
        if (p.parentId?.equals(id))
            throw new domain_error_1.InvariantViolationError("A department cannot be its own parent.");
        return new Department(id, { ...p, isActive: true, sourceSystem: "MANUAL" });
    }
    static fromExternal(id, p) {
        return new Department(id, {
            parentId: p.parentId, unitTypeId: p.unitTypeId, name: p.name,
            isActive: true, externalRef: p.externalRef, sourceSystem: p.externalRef.source, lastSyncedAt: p.syncedAt,
        });
    }
    static rehydrate(id, props) { return new Department(id, props); }
    rename(name) {
        this.props.name = name;
    }
    deactivate() { this.props.isActive = false; }
    attachTo(parentId) {
        if (parentId.equals(this.id))
            throw new domain_error_1.InvariantViolationError("A department cannot be its own parent.");
        this.props.parentId = parentId;
    }
    applyExternalUpdate(name, syncedAt, unitTypeId) {
        this.props.name = name;
        if (unitTypeId)
            this.props.unitTypeId = unitTypeId;
        this.props.isActive = true;
        this.props.lastSyncedAt = syncedAt;
    }
    get parentId() {
        return this.props.
            parentId;
    }
    get isActive() { return this.props.isActive; }
    get unitTypeId() { return this.props.unitTypeId; }
    get externalRef() { return this.props.externalRef; }
    snapshot() {
        return {
            parentId: this.props.parentId?.toString(),
            unitTypeId: this.props.unitTypeId.toString(),
            name: this.props.name.toJSON(),
            description: this.props.description?.toJSON(),
            isActive: this.props.isActive,
            externalId: this.props.externalRef?.id,
            sourceSystem: this.props.sourceSystem,
            lastSyncedAt: this.props.lastSyncedAt,
        };
    }
}
exports.Department = Department;
//# sourceMappingURL=department.js.map