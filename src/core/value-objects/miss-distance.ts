export class MissDistance {
  private constructor(readonly meters: number) {}

  static create(meters: number): MissDistance {
    if (meters < 0) throw new Error('MissDistance não pode ser negativa')
    return new MissDistance(meters)
  }

  isDangerous(): boolean {
    return this.meters < 5000
  }

  isCritical(): boolean {
    return this.meters < 1000
  }

  toDisplayString(): string {
    if (this.meters < 1000) return `${Math.round(this.meters)}m`
    return `${(this.meters / 1000).toFixed(1)}km`
  }
}
