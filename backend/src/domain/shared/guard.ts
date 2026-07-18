import { RequiredFieldError } from "./domain-error"
export const Guard = {
againstEmpty(value: string | null | undefined, field: string): string {
if (!value || value.trim().length === 0) throw new RequiredFieldError(field)
return value.trim()
},
oneOf<T extends string>(value: string, allowed: readonly T[], field: string): T {
if (!allowed.includes(value as T))
throw new RequiredFieldError(`${field} (must be one of ${allowed.join(", ")})`)
return value as T
},
}