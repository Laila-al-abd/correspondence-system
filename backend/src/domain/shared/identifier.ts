export class Identifier {
private constructor(private readonly value: bigint) {}
static of(value: bigint | number | string): Identifier {
return new Identifier(typeof value === "bigint" ? value : 
BigInt(value))
}
toBigInt(): bigint { return this.value }
toString(): string { return this.value.toString() }
equals(other?: Identifier): boolean { return !!other && other.value === this.value }
}