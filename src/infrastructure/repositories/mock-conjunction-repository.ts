import { IConjunctionRepository } from '@/domain/repositories/i-conjunction-repository'
import { ConjunctionEvent, SatelliteObject, SatelliteObjectType } from '@/domain/entities'
import {
  NoradId,
  TLEData,
  ProbabilityOfCollision,
  MissDistance,
  TimeToClosestApproach,
  type Severity,
} from '@/domain/value-objects'

const L1_ISS = '1 25544U 98067A   21275.51782528  .00005745  00000-0  11227-3 0  9993'
const L2_ISS = '2 25544  51.6441 290.5490 0003799 102.9970 332.5663 15.48862740304656'
const L1_SL1 = '1 44713U 19074A   21275.51612742  .00000078  00000-0  24334-4 0  9993'
const L2_SL1 = '2 44713  53.0538 344.4309 0001318  94.1468 265.9876 15.06380308 57224'
const L1_SL2 = '1 44714U 19074B   21275.51612742  .00000082  00000-0  25891-4 0  9990'
const L2_SL2 = '2 44714  53.0535 344.4290 0001421  95.2019 264.9219 15.06381102 57219'
const L1_DEB = '1 36508U 09004A   21275.50000000  .00001425  00000-0  16981-3 0  9999'
const L2_DEB = '2 36508  74.0324  12.4918 0099816  25.5987 334.8271 14.56143282672843'

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
  // CRITICAL — ISS × debris
  ConjunctionEvent.create({
    objectA: sat(25544, 'ISS (ZARYA)', SatelliteObjectType.OPERATIONAL_SATELLITE, L1_ISS, L2_ISS),
    objectB: sat(36508, 'COSMOS 2251 DEB', SatelliteObjectType.DEBRIS, L1_DEB, L2_DEB),
    pc: ProbabilityOfCollision.create(5e-4),
    missDistance: MissDistance.create(420),
    tcpa: TimeToClosestApproach.create(h(2)),
  }),
  // CRITICAL — Starlink × polar debris
  ConjunctionEvent.create({
    objectA: sat(49260, 'STARLINK-2150', SatelliteObjectType.OPERATIONAL_SATELLITE, L1_SL1, L2_SL1),
    objectB: sat(40271, 'FENGYUN 1C DEB', SatelliteObjectType.DEBRIS, L1_DEB, L2_DEB),
    pc: ProbabilityOfCollision.create(3e-4),
    missDistance: MissDistance.create(280),
    tcpa: TimeToClosestApproach.create(h(3)),
  }),
  // CRITICAL — Hubble × debris (different region)
  ConjunctionEvent.create({
    objectA: sat(20580, 'HUBBLE', SatelliteObjectType.OPERATIONAL_SATELLITE, L1_ISS, L2_ISS),
    objectB: sat(38321, 'IRIDIUM 33 DEB', SatelliteObjectType.DEBRIS, L1_DEB, L2_DEB),
    pc: ProbabilityOfCollision.create(2e-4),
    missDistance: MissDistance.create(560),
    tcpa: TimeToClosestApproach.create(h(4)),
  }),
  // WARNING — Starlink constellation pair
  ConjunctionEvent.create({
    objectA: sat(44713, 'STARLINK-1007', SatelliteObjectType.OPERATIONAL_SATELLITE, L1_SL1, L2_SL1),
    objectB: sat(44714, 'STARLINK-1008', SatelliteObjectType.OPERATIONAL_SATELLITE, L1_SL2, L2_SL2),
    pc: ProbabilityOfCollision.create(5e-5),
    missDistance: MissDistance.create(2800),
    tcpa: TimeToClosestApproach.create(h(6)),
  }),
  // WARNING — Terra × debris (polar orbit)
  ConjunctionEvent.create({
    objectA: sat(27424, 'TERRA', SatelliteObjectType.OPERATIONAL_SATELLITE, L1_DEB, L2_DEB),
    objectB: sat(36508, 'COSMOS 2251 DEB', SatelliteObjectType.DEBRIS, L1_DEB, L2_DEB),
    pc: ProbabilityOfCollision.create(6e-5),
    missDistance: MissDistance.create(1500),
    tcpa: TimeToClosestApproach.create(h(5)),
  }),
  // WARNING — Jason-3 × Starlink
  ConjunctionEvent.create({
    objectA: sat(41240, 'JASON-3', SatelliteObjectType.OPERATIONAL_SATELLITE, L1_ISS, L2_ISS),
    objectB: sat(44730, 'STARLINK-1024', SatelliteObjectType.OPERATIONAL_SATELLITE, L1_SL2, L2_SL2),
    pc: ProbabilityOfCollision.create(2e-5),
    missDistance: MissDistance.create(4200),
    tcpa: TimeToClosestApproach.create(h(9)),
  }),
  // INFO — Sentinel × Starlink
  ConjunctionEvent.create({
    objectA: sat(41335, 'SENTINEL-2A', SatelliteObjectType.OPERATIONAL_SATELLITE, L1_DEB, L2_DEB),
    objectB: sat(49261, 'STARLINK-2151', SatelliteObjectType.OPERATIONAL_SATELLITE, L1_SL1, L2_SL1),
    pc: ProbabilityOfCollision.create(3e-6),
    missDistance: MissDistance.create(12000),
    tcpa: TimeToClosestApproach.create(h(14)),
  }),
  // INFO — OneWeb × Starlink (different orbital plane)
  ConjunctionEvent.create({
    objectA: sat(45016, 'ONEWEB-0012', SatelliteObjectType.OPERATIONAL_SATELLITE, L1_SL2, L2_SL2),
    objectB: sat(44731, 'STARLINK-1025', SatelliteObjectType.OPERATIONAL_SATELLITE, L1_SL1, L2_SL1),
    pc: ProbabilityOfCollision.create(5e-7),
    missDistance: MissDistance.create(30000),
    tcpa: TimeToClosestApproach.create(h(20)),
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
