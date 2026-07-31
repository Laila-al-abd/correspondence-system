/**
 * Opaque aggregate identifier. Backed by a UUID string: the application
 * generates UUIDv7 values behind the `IdGenerator` port, and the database
 * stores them in native `uuid` columns. Nothing outside infrastructure needs
 * to know the format — the domain only ever compares and prints them.
 */
export class Identifier {
  private constructor(private readonly value: string) {}

  static of(value: string): Identifier {
    const normalised = value.trim().toLowerCase()
    if (!normalised) throw new Error("Identifier cannot be empty.")
    return new Identifier(normalised)
  }

  toString(): string {
    return this.value
  }

  equals(other?: Identifier): boolean {
    return !!other && other.value === this.value
  }
}
