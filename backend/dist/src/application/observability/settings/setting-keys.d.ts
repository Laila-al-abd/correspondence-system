export declare const REQUEST_NUMBERING_SETTING_KEY = "request_numbering";
export interface SettingDefinition {
    key: string;
    description: string;
    defaultValue: unknown;
    validate(value: unknown): void;
    invalidatesWorkingHours: boolean;
}
export declare const SETTING_DEFINITIONS: SettingDefinition[];
export declare function settingDefinition(key: string): SettingDefinition;
