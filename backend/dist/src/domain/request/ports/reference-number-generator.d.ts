export interface ReferenceNumberGenerator {
    next(at?: Date): Promise<string>;
}
