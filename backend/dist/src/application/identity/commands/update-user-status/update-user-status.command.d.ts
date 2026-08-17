export interface UpdateUserStatusInput {
    userId: string;
    status: string;
}
export declare class UpdateUserStatusCommand {
    readonly input: UpdateUserStatusInput;
    constructor(input: UpdateUserStatusInput);
}
