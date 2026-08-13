import { AggregateRoot } from "../shared/entity";
import { Identifier } from "../shared/identifier";
import { LocalizedText } from "../shared/localized-text";
import { WorkflowStep } from "./workflow-step";
interface WorkflowPathProps {
    templateId: Identifier;
    name: LocalizedText;
    description?: LocalizedText;
    isActive: boolean;
    steps: WorkflowStep[];
}
export declare class WorkflowPath extends AggregateRoot {
    private props;
    private constructor();
    static create(id: Identifier, p: {
        templateId: Identifier;
        name: LocalizedText;
        description?: LocalizedText;
    }): WorkflowPath;
    static rehydrate(id: Identifier, props: WorkflowPathProps): WorkflowPath;
    addStep(step: WorkflowStep): void;
    activate(): void;
    deactivate(): void;
    get steps(): readonly WorkflowStep[];
    get isActive(): boolean;
    get templateId(): Identifier;
    entrySteps(): WorkflowStep[];
    assertValidGraph(): void;
    dependencyMap(): Map<string, string[]>;
    snapshot(): {
        templateId: string;
        name: {
            ar: string;
            en?: string;
        };
        description?: {
            ar: string;
            en?: string;
        };
        isActive: boolean;
        steps: ReturnType<WorkflowStep["snapshot"]>[];
    };
}
export {};
