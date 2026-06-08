import { ClassifyRisk } from './classify-risk'
import { ProbabilityOfCollision } from '@/core/value-objects/probability-of-collision'
import { MissDistance } from '@/core/value-objects/miss-distance'

describe('ClassifyRisk', () => {
  const sut = new ClassifyRisk()

  describe('quando MissDistance é crítica (< 1000m)', () => {
    it('retorna CRITICAL independente do Pc', () => {
      const pc = ProbabilityOfCollision.create(1e-6) // INFO por Pc
      const miss = MissDistance.create(500) // crítica

      expect(sut.execute(pc, miss)).toBe('CRITICAL')
    })

    it('retorna CRITICAL mesmo com Pc zero', () => {
      const pc = ProbabilityOfCollision.create(0)
      const miss = MissDistance.create(999)

      expect(sut.execute(pc, miss)).toBe('CRITICAL')
    })
  })

  describe('quando MissDistance não é crítica', () => {
    it('retorna CRITICAL quando Pc > 1e-4', () => {
      const pc = ProbabilityOfCollision.create(5e-4)
      const miss = MissDistance.create(2000)

      expect(sut.execute(pc, miss)).toBe('CRITICAL')
    })

    it('retorna WARNING quando Pc entre 1e-5 e 1e-4', () => {
      const pc = ProbabilityOfCollision.create(5e-5)
      const miss = MissDistance.create(2000)

      expect(sut.execute(pc, miss)).toBe('WARNING')
    })

    it('retorna WARNING exatamente no threshold de 1e-5 + epsilon', () => {
      const pc = ProbabilityOfCollision.create(1.1e-5)
      const miss = MissDistance.create(3000)

      expect(sut.execute(pc, miss)).toBe('WARNING')
    })

    it('retorna INFO quando Pc <= 1e-5', () => {
      const pc = ProbabilityOfCollision.create(1e-5)
      const miss = MissDistance.create(5000)

      expect(sut.execute(pc, miss)).toBe('INFO')
    })

    it('retorna INFO quando Pc é zero', () => {
      const pc = ProbabilityOfCollision.create(0)
      const miss = MissDistance.create(10000)

      expect(sut.execute(pc, miss)).toBe('INFO')
    })
  })
})
