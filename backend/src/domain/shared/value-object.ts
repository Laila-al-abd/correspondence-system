export abstract class ValueObject<T extends Record<string, unknown>> {
protected constructor(protected readonly props: T) { Object.freeze(props) }
equals(other?: ValueObject<T>): boolean {
return !!other && JSON.stringify(this.props) === JSON.stringify(other.props)
}
}