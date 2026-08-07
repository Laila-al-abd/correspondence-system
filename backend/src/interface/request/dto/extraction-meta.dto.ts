import { plainToInstance } from 'class-transformer'
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
  validateSync,
} from 'class-validator'

/**
 * Where one extracted value came from.
 *
 * Validated rather than waved through, because this block is not display data:
 * it is written straight into `ml_predictions`, which is the evidence behind
 * every per-field accuracy figure the project reports. A score arriving as a
 * string, or a character offset arriving negative, would be stored without
 * complaint and would quietly corrupt that table -- and nobody reads a
 * measurement table closely enough to notice.
 */
export class ExtractionMetaDto {
  /** The span exactly as it appeared in the request text. */
  @IsOptional()
  @IsString()
  raw?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  charStart?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  charEnd?: number

  /**
   * The model's logit margin. Deliberately only `@IsNumber()`: it is an
   * uncalibrated margin that may exceed 1 and may go negative, so bounding it
   * to 0..1 would reject honest values and imply a probability it is not.
   */
  @IsOptional()
  @IsNumber()
  score?: number
}

/**
 * Validates a record whose keys are template field keys and whose values are
 * ExtractionMetaDto.
 *
 * A custom constraint because the keys are not known in advance -- they are
 * whatever fields the template declares -- and `@ValidateNested()` can only
 * describe fixed properties or arrays.
 */
export function IsExtractionMetaRecord(options?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isExtractionMetaRecord',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown): boolean {
          if (
            value === null ||
            typeof value !== 'object' ||
            Array.isArray(value)
          )
            return false
          return Object.values(value as Record<string, unknown>).every(
            (entry) => {
              if (
                entry === null ||
                typeof entry !== 'object' ||
                Array.isArray(entry)
              )
                return false
              return (
                validateSync(plainToInstance(ExtractionMetaDto, entry), {
                  whitelist: false,
                }).length === 0
              )
            },
          )
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must map each field key to { raw?, charStart?, charEnd?, score? }`
        },
      },
    })
  }
}
