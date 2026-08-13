import { ValidationOptions } from 'class-validator';
export declare class ExtractionMetaDto {
    raw?: string;
    charStart?: number;
    charEnd?: number;
    score?: number;
}
export declare function IsExtractionMetaRecord(options?: ValidationOptions): (object: object, propertyName: string) => void;
