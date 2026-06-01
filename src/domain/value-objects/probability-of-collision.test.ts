import { ProbabilityOfCollision } from './probability-of-collision'

describe('ProbabilityOfCollision', () => {
  describe('create', () => {
    it('retorna instância para valor válido', () => {
      expect(ProbabilityOfCollision.create(1.4e-3)).toBeInstanceOf(ProbabilityOfCollision)
    })

    it('lança erro para valor negativo', () => {
      expect(() => ProbabilityOfCollision.create(-0.1)).toThrow('ProbabilityOfCollision deve estar entre 0 e 1')
    })

    it('lança erro para valor maior que 1', () => {
      expect(() => ProbabilityOfCollision.create(1.1)).toThrow('ProbabilityOfCollision deve estar entre 0 e 1')
    })

    it('aceita exatamente 0 e 1', () => {
      expect(() => ProbabilityOfCollision.create(0)).not.toThrow()
      expect(() => ProbabilityOfCollision.create(1)).not.toThrow()
    })
  })

  describe('exceedsThreshold', () => {
    it('retorna true para Pc > 1e-4', () => {
      expect(ProbabilityOfCollision.create(1e-3).exceedsThreshold()).toBe(true)
    })

    it('retorna false para Pc = 1e-4 (limiar não incluso)', () => {
      expect(ProbabilityOfCollision.create(1e-4).exceedsThreshold()).toBe(false)
    })

    it('retorna false para Pc < 1e-4', () => {
      expect(ProbabilityOfCollision.create(1e-5).exceedsThreshold()).toBe(false)
    })
  })

  describe('toSeverity', () => {
    it('retorna CRITICAL para Pc > 1e-4', () => {
      expect(ProbabilityOfCollision.create(1e-3).toSeverity()).toBe('CRITICAL')
    })

    it('retorna WARNING para Pc entre 1e-5 e 1e-4', () => {
      expect(ProbabilityOfCollision.create(5e-5).toSeverity()).toBe('WARNING')
    })

    it('retorna INFO para Pc <= 1e-5', () => {
      expect(ProbabilityOfCollision.create(1e-6).toSeverity()).toBe('INFO')
    })

    it('retorna INFO para Pc = 1e-5 (limiar incluso no INFO)', () => {
      expect(ProbabilityOfCollision.create(1e-5).toSeverity()).toBe('INFO')
    })
  })

  describe('toScientificNotation', () => {
    it('formata 1.4e-3 como "1.4 × 10⁻³"', () => {
      expect(ProbabilityOfCollision.create(1.4e-3).toScientificNotation()).toBe('1.4 × 10⁻³')
    })

    it('formata 5e-5 como "5.0 × 10⁻⁵"', () => {
      expect(ProbabilityOfCollision.create(5e-5).toScientificNotation()).toBe('5.0 × 10⁻⁵')
    })
  })
})
