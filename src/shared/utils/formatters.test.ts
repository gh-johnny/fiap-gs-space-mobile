import { formatPc, formatDistance, formatTcpa } from './formatters'
import { ProbabilityOfCollision, MissDistance, TimeToClosestApproach } from '@/core/value-objects'

describe('formatters', () => {
  describe('formatPc', () => {
    it('formata Pc em notação científica', () => {
      const pc = ProbabilityOfCollision.create(1.4e-3)
      expect(formatPc(pc)).toMatch(/×\s*10/)
    })

    it('formata Pc zero', () => {
      const pc = ProbabilityOfCollision.create(0)
      expect(formatPc(pc)).toBeTruthy()
    })
  })

  describe('formatDistance', () => {
    it('formata distância em metros quando < 1000m', () => {
      const miss = MissDistance.create(420)
      expect(formatDistance(miss)).toBe('420m')
    })

    it('formata distância em km quando >= 1000m', () => {
      const miss = MissDistance.create(2500)
      expect(formatDistance(miss)).toBe('2.5km')
    })
  })

  describe('formatTcpa', () => {
    it('formata TCPA como horas e minutos', () => {
      const tcpa = TimeToClosestApproach.create(new Date(Date.now() + 90 * 60_000))
      expect(formatTcpa(tcpa)).toMatch(/\dh \d{2}min/)
    })
  })
})
