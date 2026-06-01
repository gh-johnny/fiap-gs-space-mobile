import { SatelliteJsAdapter } from './satellite-js-adapter'
import { TLEData, NoradId } from '@/domain/value-objects'

// TLE real da ISS (ZARYA) — dados históricos válidos para propagação
const ISS_LINE1 = '1 25544U 98067A   21275.51782528  .00005745  00000-0  11227-3 0  9993'
const ISS_LINE2 = '2 25544  51.6441 290.5490 0003799 102.9970 332.5663 15.48862740304656'
const ISS_NORAD_ID = 25544

// TLE sintético com campos corrompidos para forçar erro do propagator
const CORRUPT_LINE1 = '1 99999U 00000A   99999.99999999  .00000000  00000-0  00000-0 0  0000'
const CORRUPT_LINE2 = '2 99999 999.9999 999.9999 9999999 999.9999 999.9999 99.99999999000000'

describe('SatelliteJsAdapter', () => {
  const sut = new SatelliteJsAdapter()

  describe('propagate com TLE válido', () => {
    const tle = TLEData.create(ISS_LINE1, ISS_LINE2)
    const timestamp = new Date('2021-10-02T12:25:40Z') // correspondente ao epoch do TLE

    it('retorna OrbitPosition com noradId correto', () => {
      const result = sut.propagate(tle, timestamp)
      expect(result).not.toBeNull()
      expect(result!.noradId.value).toBe(ISS_NORAD_ID)
    })

    it('retorna lat entre -90 e 90', () => {
      const result = sut.propagate(tle, timestamp)
      expect(result).not.toBeNull()
      expect(result!.lat).toBeGreaterThanOrEqual(-90)
      expect(result!.lat).toBeLessThanOrEqual(90)
    })

    it('retorna lng entre -180 e 180', () => {
      const result = sut.propagate(tle, timestamp)
      expect(result).not.toBeNull()
      expect(result!.lng).toBeGreaterThanOrEqual(-180)
      expect(result!.lng).toBeLessThanOrEqual(180)
    })

    it('retorna alt positiva (km)', () => {
      const result = sut.propagate(tle, timestamp)
      expect(result).not.toBeNull()
      expect(result!.alt).toBeGreaterThan(0)
    })
  })

  describe('propagate com TLE inválido', () => {
    it('retorna null sem lançar exceção', () => {
      const tle = TLEData.create(CORRUPT_LINE1, CORRUPT_LINE2)
      expect(() => sut.propagate(tle, new Date())).not.toThrow()
      expect(sut.propagate(tle, new Date())).toBeNull()
    })
  })
})
