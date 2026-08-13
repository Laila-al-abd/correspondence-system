import { Entity } from "../shared/entity";
import { Identifier } from "../shared/identifier";
import { ModelType } from "./enums";
interface MlPredictionProps {
    requestId: Identifier;
    modelType: ModelType;
    fieldKey?: string;
    modelVersion: string;
    predictedValue: unknown;
    confidence?: number;
    createdAt: Date;
}
export declare class MlPrediction extends Entity {
    private props;
    private constructor();
    static create(id: Identifier, p: {
        requestId: Identifier;
        modelType: ModelType;
        fieldKey?: string;
        modelVersion: string;
        predictedValue: unknown;
        confidence?: number;
    }): MlPrediction;
    static rehydrate(id: Identifier, props: MlPredictionProps): MlPrediction;
    snapshot(): {
        requestId: string;
        modelType: ModelType;
        fieldKey?: string;
        modelVersion: string;
        predictedValue: unknown;
        confidence?: number;
        createdAt: Date;
    };
    isConfident(threshold?: number): boolean;
    get modelType(): ModelType;
    get fieldKey(): string | undefined;
    get predictedValue(): unknown;
    get confidence(): number | undefined;
}
export {};
