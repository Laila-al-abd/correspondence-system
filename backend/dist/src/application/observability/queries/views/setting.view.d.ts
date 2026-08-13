export interface SettingView {
    key: string;
    value: unknown;
    description?: string;
    configured: boolean;
    updatedAt?: string;
    updatedBy?: string;
}
export interface SettingKeyView {
    key: string;
    description: string;
}
