import { IConjunctionRepository } from '@/core/repositories/i-conjunction-repository'
import { ConjunctionEvent, SatelliteObject, SatelliteObjectType } from '@/core/entities'
import {
  NoradId,
  TLEData,
  ProbabilityOfCollision,
  MissDistance,
  TimeToClosestApproach,
  type Severity,
} from '@/core/value-objects'

// ── Operational satellites ────────────────────────────────────────────────────
const L1_ISS  = '1 25544U 98067A   26159.50000000  .00005745  00000-0  11227-3 0  9993'
const L2_ISS  = '2 25544  51.6441 290.5490 0003799 102.9970 332.5663 15.48862740304656'
const L1_HUB  = '1 20580U 90037B   26159.50000000  .00001218  00000-0  59985-4 0  9994'
const L2_HUB  = '2 20580  28.4698  99.1284 0002783  79.7869 280.3487 15.09696086 10277'
const L1_SL1  = '1 44713U 19074A   26159.50000000  .00000078  00000-0  24334-4 0  9993'
const L2_SL1  = '2 44713  53.0538 344.4309 0001318  94.1468 265.9876 15.06380308 57224'

// ── Uncontrollable bodies ─────────────────────────────────────────────────────
const L1_AST1 = '1 90001U 21001A   26159.50000000  .00001000  00000-0  10000-4 0  9992'
const L2_AST1 = '2 90001  62.3400 134.8900 0124578 310.5421  45.2318 13.70123000102345'
const L1_DEB1 = '1 36508U 09004A   26159.50000000  .00001425  00000-0  16981-3 0  9999'
const L2_DEB1 = '2 36508  54.0324 189.4918 0099816  25.5987 334.8271 14.56143282672843'
const L1_DEB2 = '1 38321U 09005C   26159.50000000  .00002145  00000-0  24893-3 0  9993'
const L2_DEB2 = '2 38321  56.4012  62.9812 0137892 156.7819 204.5371 14.49874362682914'

function sat(id: number, name: string, type: SatelliteObjectType, l1: string, l2: string) {
  return SatelliteObject.create({
    noradId: NoradId.create(id),
    name,
    type,
    tleData: TLEData.create(l1, l2),
  })
}

const h = (hours: number) => new Date(Date.now() + hours * 3600_000)

const EVENTS: ConjunctionEvent[] = [
  // CRITICAL — ISS × APOPHIS-2029
  ConjunctionEvent.create({
    objectA: sat(25544, 'ISS (ZARYA)', SatelliteObjectType.OPERATIONAL_SATELLITE, L1_ISS, L2_ISS),
    objectB: sat(90001, 'APOPHIS-2029', SatelliteObjectType.ASTEROID, L1_AST1, L2_AST1),
    pc: ProbabilityOfCollision.create(5e-4),
    missDistance: MissDistance.create(380),
    tcpa: TimeToClosestApproach.create(h(2)),
  }),
  // WARNING — Hubble × COSMOS 2251 DEB
  ConjunctionEvent.create({
    objectA: sat(20580, 'HUBBLE', SatelliteObjectType.OPERATIONAL_SATELLITE, L1_HUB, L2_HUB),
    objectB: sat(36508, 'COSMOS 2251 DEB', SatelliteObjectType.DEBRIS, L1_DEB1, L2_DEB1),
    pc: ProbabilityOfCollision.create(6e-5),
    missDistance: MissDistance.create(1400),
    tcpa: TimeToClosestApproach.create(h(5)),
  }),
  // INFO — Starlink-1007 × IRIDIUM 33 DEB
  ConjunctionEvent.create({
    objectA: sat(44713, 'STARLINK-1007', SatelliteObjectType.OPERATIONAL_SATELLITE, L1_SL1, L2_SL1),
    objectB: sat(38321, 'IRIDIUM 33 DEB', SatelliteObjectType.DEBRIS, L1_DEB2, L2_DEB2),
    pc: ProbabilityOfCollision.create(5e-6),
    missDistance: MissDistance.create(11000),
    tcpa: TimeToClosestApproach.create(h(15)),
  }),
]

export class MockConjunctionRepository implements IConjunctionRepository {
  async findAll(): Promise<ConjunctionEvent[]> {
    return EVENTS
  }

  async findBySeverity(severity: Severity): Promise<ConjunctionEvent[]> {
    return EVENTS.filter((e) => e.severity === severity)
  }
}
