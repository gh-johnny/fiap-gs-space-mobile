export type Severity = 'CRITICAL' | 'WARNING' | 'INFO'

const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻',
}

export class ProbabilityOfCollision {
  private constructor(readonly value: number) {}

  static create(value: number): ProbabilityOfCollision {
    if (value < 0 || value > 1) {
      throw new Error('ProbabilityOfCollision deve estar entre 0 e 1')
    }
    return new ProbabilityOfCollision(value)
  }

  exceedsThreshold(): boolean {
    return this.value > 1e-4
  }

  toSeverity(): Severity {
    if (this.value > 1e-4) return 'CRITICAL'
    if (this.value > 1e-5) return 'WARNING'
    return 'INFO'
  }

  toScientificNotation(): string {
    const exp = this.value.toExponential(1)
    const [mantissa, exponent] = exp.split('e')
    const superscript = exponent!
      .replace(/[0-9-]/g, (c) => SUPERSCRIPTS[c] ?? c)
    return `${mantissa} × 10${superscript}`
  }
}
