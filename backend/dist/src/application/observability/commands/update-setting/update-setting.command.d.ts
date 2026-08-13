export declare class UpdateSettingCommand {
    readonly key: string;
    readonly value: unknown;
    readonly userId: string;
    readonly description?: string | undefined;
    constructor(key: string, value: unknown, userId: string, description?: string | undefined);
}
