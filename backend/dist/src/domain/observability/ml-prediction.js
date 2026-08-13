"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MlPrediction = void 0;
const entity_1 = require("../shared/entity");
const guard_1 = require("../shared/guard");
class MlPrediction extends entity_1.Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, p) {
        guard_1.Guard.againstEmpty(p.modelVersion, "modelVersion");
        return new MlPrediction(id, { ...p, createdAt: new Date() });
    }
    static rehydrate(id, props) {
        return new MlPrediction(id, props);
    }
    snapshot() {
        return {
            requestId: this.props.requestId.toString(),
            modelType: this.props.modelType,
            fieldKey: this.props.fieldKey,
            modelVersion: this.props.modelVersion,
            predictedValue: this.props.predictedValue,
            confidence: this.props.confidence,
            createdAt: this.props.createdAt,
        };
    }
    isConfident(threshold = 0.8) {
        return this.props.confidence !== undefined && this.props.confidence >= threshold;
    }
    get modelType() { return this.props.modelType; }
    get fieldKey() { return this.props.fieldKey; }
    get predictedValue() { return this.props.predictedValue; }
    get confidence() { return this.props.confidence; }
}
exports.MlPrediction = MlPrediction;
//# sourceMappingURL=ml-prediction.js.map