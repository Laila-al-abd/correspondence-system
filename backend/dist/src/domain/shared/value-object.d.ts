export declare abstract class ValueObject<T extends Record<string, unknown>> {
    protected readonly props: T;
    protected constructor(props: T);
    equals(other?: ValueObject<T>): boolean;
}
