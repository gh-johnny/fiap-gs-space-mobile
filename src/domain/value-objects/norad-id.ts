export class NoradId {
  private constructor(readonly value: number) {}

  static create(value: number): NoradId {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error('NoradId deve ser um inteiro positivo')
    }
    return new NoradId(value)
  }

  toString(): string {
    return String(this.value)
  }

  equals(other: NoradId): boolean {
    return this.value === other.value
  }
}
