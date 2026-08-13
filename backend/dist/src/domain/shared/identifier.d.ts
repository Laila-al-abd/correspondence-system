export declare class Identifier {
    private readonly value;
    private constructor();
    static of(value: string): Identifier;
    toString(): string;
    equals(other?: Identifier): boolean;
}
