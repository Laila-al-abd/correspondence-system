import { AggregateRoot } from "../shared/entity";
import { Identifier } from "../shared/identifier";
interface SystemSettingProps {
    key: string;
    value: unknown;
    description?: string;
    updatedBy?: Identifier;
    updatedAt: Date;
}
export declare class SystemSetting extends AggregateRoot {
    private props;
    private constructor();
    static create(id: Identifier, p: {
        key: string;
        value: unknown;
        description?: string;
        updatedBy?: Identifier;
    }): SystemSetting;
    static rehydrate(id: Identifier, props: SystemSettingProps): SystemSetting;
    snapshot(): {
        key: string;
        value: unknown;
        description?: string;
        updatedBy?: string;
        updatedAt: Date;
    };
    update(value: unknown, updatedBy?: Identifier): void;
    get key(): string;
    get value(): unknown;
}
export {};
