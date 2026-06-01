import { ProbabilityOfCollision, MissDistance, TimeToClosestApproach, type Severity } from '@/domain/value-objects'
import { SatelliteObject } from './satellite-object'

export class ConjunctionEvent {
  readonly severity: Severity

  private constructor(
    readonly objectA: SatelliteObject,
    readonly objectB: SatelliteObject,
    readonly pc: ProbabilityOfCollision,
    readonly missDistance: MissDistance,
    readonly tcpa: TimeToClosestApproach,
  ) {
    this.severity = missDistance.isCritical() ? 'CRITICAL' : pc.toSeverity()
  }

  static create(params: {
    objectA: SatelliteObject
    objectB: SatelliteObject
    pc: ProbabilityOfCollision
    missDistance: MissDistance
    tcpa: TimeToClosestApproach
  }): ConjunctionEvent {
    return new ConjunctionEvent(
      params.objectA,
      params.objectB,
      params.pc,
      params.missDistance,
      params.tcpa,
    )
  }

  isActive(): boolean {
    return this.tcpa.actionWindowIsOpen()
  }
}
