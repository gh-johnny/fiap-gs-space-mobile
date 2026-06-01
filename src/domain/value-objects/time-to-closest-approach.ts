const ACTION_WINDOW_HOURS = 4

export class TimeToClosestApproach {
  private constructor(readonly date: Date) {}

  static create(date: Date): TimeToClosestApproach {
    return new TimeToClosestApproach(date)
  }

  actionWindowIsOpen(): boolean {
    const hoursUntil = (this.date.getTime() - Date.now()) / (1000 * 60 * 60)
    return hoursUntil > ACTION_WINDOW_HOURS
  }

  toDisplayString(): string {
    const totalMinutes = Math.max(0, Math.round((this.date.getTime() - Date.now()) / (1000 * 60)))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}h ${String(minutes).padStart(2, '0')}min`
  }

  toUtcString(): string {
    const hh = String(this.date.getUTCHours()).padStart(2, '0')
    const mm = String(this.date.getUTCMinutes()).padStart(2, '0')
    return `até ${hh}:${mm} UTC`
  }
}
