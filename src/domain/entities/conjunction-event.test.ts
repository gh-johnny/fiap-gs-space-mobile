import { ConjunctionEvent } from './conjunction-event'
import { SatelliteObject, SatelliteObjectType } from './satellite-object'
import { NoradId, TLEData, ProbabilityOfCollision, MissDistance, TimeToClosestApproach } from '@/domain/value-objects'

const L1 = '1 44713U 19074A   20325.51612742  .00000078  00000-0  24334-4 0  9993'
const L2 = '2 44713  53.0538 344.4309 0001318  94.1468 265.9876 15.06380308 57224'
const L1B = '1 25544U 98067A   20325.51612742  .00002182  00000-0  46379-4 0  9993'
const L2B = '2 25544  51.6442  15.5932 0001470 352.8472 164.5957 15.49215693254837'

function makeSat(id: number, name: string) {
  return SatelliteObject.create({
    noradId: NoradId.create(id),
    name,
    type: SatelliteObjectType.OPERATIONAL_SATELLITE,
    tleData: TLEData.create(id === 44713 ? L1 : L1B, id === 44713 ? L2 : L2B),
  })
}

function makeParams(tcpaHours = 5) {
  return {
    objectA: makeSat(44713, 'STARLINK-1007'),
    objectB: makeSat(25544, 'ISS'),
    pc: ProbabilityOfCollision.create(1.4e-3),
    missDistance: MissDistance.create(847),
    tcpa: TimeToClosestApproach.create(new Date(Date.now() + tcpaHours * 3600 * 1000)),
  }
}

describe('ConjunctionEvent', () => {
  describe('create', () => {
    it('retorna instância com todos os campos', () => {
      const event = ConjunctionEvent.create(makeParams())
      expect(event).toBeInstanceOf(ConjunctionEvent)
      expect(event.objectA.name).toBe('STARLINK-1007')
      expect(event.objectB.name).toBe('ISS')
    })

    it('expõe severity derivada de Pc e MissDistance', () => {
      const event = ConjunctionEvent.create(makeParams())
      expect(event.severity).toBe('CRITICAL')
    })
  })

  describe('isActive', () => {
    it('retorna true quando janela de ação está aberta (TCPA > 4h)', () => {
      expect(ConjunctionEvent.create(makeParams(5)).isActive()).toBe(true)
    })

    it('retorna false quando janela de ação está fechada (TCPA <= 4h)', () => {
      expect(ConjunctionEvent.create(makeParams(3)).isActive()).toBe(false)
    })
  })
})
