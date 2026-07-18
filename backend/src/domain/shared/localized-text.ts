import { ValueObject } from "./value-object"
import { Guard } from "./guard"
// Mirrors the JSONB { "ar": "…", "en": "…" } shape used across the spec.
export class LocalizedText extends ValueObject<{ ar: string; 
en?: string }> {
private constructor(props: { ar: string; en?: string }) { super(props) }
static create(ar: string, en?: string): LocalizedText {
return new LocalizedText({ ar: Guard.againstEmpty(ar, "ar"), en: en?.trim() || undefined })
}
get ar(): string { return this.props.ar }
get en(): string { return this.props.en ?? this.props.ar }
toJSON(): { ar: string; en?: string } { return { ...this.props } }
}