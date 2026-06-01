import { OrbitalAlert } from './orbital-alert'
import { ConjunctionEvent } from './conjunction-event'
import { SatelliteObject, SatelliteObjectType } from './satellite-object'
import { NoradId, TLEData, ProbabilityOfCollision, MissDistance, TimeToClosestApproach } from '@/domain/value-objects'

const L1 = '1 44713U 19074A   20325.51612742  .00000078  00000-0  24334-4 0  9993'
const L2 = '2 44713  53.0538 344.4309 0001318  94.1468 265.9876 15.06380308 57224'
const L1B = '1 25544U 98067A   20325.51612742  .00002182  00000-0  46379-4 0  9993'
const L2B = '2 25544  51.6442  15.5932 0001470 352.8472 164.5957 15.49215693254837'

function makeEvent() {
  const makeSat = (id: number, name: string) =>
    SatelliteObject.create({
      noradId: NoradId.create(id),
      name,
      type: SatelliteObjectType.OPERATIONAL_SATELLITE,
      tleData: TLEData.create(id === 44713 ? L1 : L1B, id === 44713 ? L2 : L2B),
    })

  return ConjunctionEvent.create({
    objectA: makeSat(44713, 'STARLINK-1007'),
    objectB: makeSat(25544, 'ISS'),
    pc: ProbabilityOfCollision.create(1.4e-3),
    missDistance: MissDistance.create(847),
    tcpa: TimeToClosestApproach.create(new Date(Date.now() + 5 * 3600 * 1000)),
  })
}

describe('OrbitalAlert', () => {
  describe('create', () => {
    it('cria alerta com status detected', () => {
      const alert = OrbitalAlert.create(makeEvent())
      expect(alert.status).toBe('detected')
    })

    it('detectedAt é próximo de Date.now()', () => {
      const before = Date.now()
      const alert = OrbitalAlert.create(makeEvent())
      expect(alert.detectedAt.getTime()).toBeGreaterThanOrEqual(before)
      expect(alert.detectedAt.getTime()).toBeLessThanOrEqual(Date.now())
    })
  })

  describe('acknowledge', () => {
    it('retorna nova instância com status acknowledged', () => {
      const alert = OrbitalAlert.create(makeEvent())
      const acked = alert.acknowledge()
      expect(acked.status).toBe('acknowledged')
    })

    it('não muta a instância original', () => {
      const alert = OrbitalAlert.create(makeEvent())
      alert.acknowledge()
      expect(alert.status).toBe('detected')
    })

    it('retorna instância diferente (imutabilidade)', () => {
      const alert = OrbitalAlert.create(makeEvent())
      expect(alert.acknowledge()).not.toBe(alert)
    })
  })

  describe('dismiss', () => {
    it('retorna nova instância com status dismissed', () => {
      const alert = OrbitalAlert.create(makeEvent())
      expect(alert.dismiss().status).toBe('dismissed')
    })

    it('não muta a instância original', () => {
      const alert = OrbitalAlert.create(makeEvent())
      alert.dismiss()
      expect(alert.status).toBe('detected')
    })
  })
})
