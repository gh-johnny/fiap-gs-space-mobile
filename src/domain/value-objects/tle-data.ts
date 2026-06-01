export class TLEData {
  private constructor(
    readonly line1: string,
    readonly line2: string,
  ) {}

  static create(line1: string, line2: string): TLEData {
    if (line1.length !== 69) throw new Error('TLE line1 deve ter 69 caracteres')
    if (line2.length !== 69) throw new Error('TLE line2 deve ter 69 caracteres')
    return new TLEData(line1, line2)
  }

  isExpired(): boolean {
    const epochStr = this.line1.substring(18, 32).trim()
    const year2digit = parseInt(epochStr.substring(0, 2), 10)
    const dayOfYear = parseFloat(epochStr.substring(2))
    const fullYear = year2digit >= 57 ? 1900 + year2digit : 2000 + year2digit
    const epochDate = new Date(Date.UTC(fullYear, 0, 1))
    epochDate.setUTCDate(epochDate.getUTCDate() + Math.floor(dayOfYear) - 1)
    const ageMs = Date.now() - epochDate.getTime()
    const ageDays = ageMs / (1000 * 60 * 60 * 24)
    return ageDays > 14
  }
}
