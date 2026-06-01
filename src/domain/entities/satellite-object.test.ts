import { SatelliteObject, SatelliteObjectType } from './satellite-object'
import { NoradId, TLEData } from '@/domain/value-objects'

const VALID_LINE1 = '1 44713U 19074A   20325.51612742  .00000078  00000-0  24334-4 0  9993'
const VALID_LINE2 = '2 44713  53.0538 344.4309 0001318  94.1468 265.9876 15.06380308 57224'

function makeParams() {
  return {
    noradId: NoradId.create(44713),
    name: 'STARLINK-1007',
    type: SatelliteObjectType.OPERATIONAL_SATELLITE,
    tleData: TLEData.create(VALID_LINE1, VALID_LINE2),
  }
}

describe('SatelliteObject', () => {
  describe('create', () => {
    it('retorna instância com todos os campos', () => {
      const sat = SatelliteObject.create(makeParams())
      expect(sat).toBeInstanceOf(SatelliteObject)
      expect(sat.name).toBe('STARLINK-1007')
      expect(sat.type).toBe(SatelliteObjectType.OPERATIONAL_SATELLITE)
    })

    it('lança erro para nome vazio', () => {
      expect(() => SatelliteObject.create({ ...makeParams(), name: '' })).toThrow(
        'SatelliteObject requer um nome não vazio',
      )
    })

    it('lança erro para nome somente com espaços', () => {
      expect(() => SatelliteObject.create({ ...makeParams(), name: '   ' })).toThrow(
        'SatelliteObject requer um nome não vazio',
      )
    })

    it('expõe props como readonly', () => {
      const sat = SatelliteObject.create(makeParams())
      expect(sat.noradId.value).toBe(44713)
      expect(sat.tleData.line1).toBe(VALID_LINE1)
    })
  })
})
