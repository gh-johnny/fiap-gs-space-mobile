import { ConjunctionEvent } from './conjunction-event'

export type AlertStatus = 'detected' | 'acknowledged' | 'dismissed'

export class OrbitalAlert {
  private constructor(
    readonly id: string,
    readonly conjunctionEvent: ConjunctionEvent,
    readonly status: AlertStatus,
    readonly detectedAt: Date,
  ) {}

  static create(conjunctionEvent: ConjunctionEvent): OrbitalAlert {
    return new OrbitalAlert(
      `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      conjunctionEvent,
      'detected',
      new Date(),
    )
  }

  acknowledge(): OrbitalAlert {
    return new OrbitalAlert(this.id, this.conjunctionEvent, 'acknowledged', this.detectedAt)
  }

  dismiss(): OrbitalAlert {
    return new OrbitalAlert(this.id, this.conjunctionEvent, 'dismissed', this.detectedAt)
  }
}
