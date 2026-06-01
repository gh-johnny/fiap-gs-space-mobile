import { MissDistance } from './miss-distance'

describe('MissDistance', () => {
  describe('create', () => {
    it('retorna instância para valor válido', () => {
      expect(MissDistance.create(847)).toBeInstanceOf(MissDistance)
    })

    it('aceita zero', () => {
      expect(() => MissDistance.create(0)).not.toThrow()
    })

    it('lança erro para valor negativo', () => {
      expect(() => MissDistance.create(-1)).toThrow('MissDistance não pode ser negativa')
    })
  })

  describe('isDangerous', () => {
    it('retorna true para < 5000m', () => {
      expect(MissDistance.create(4999).isDangerous()).toBe(true)
    })

    it('retorna false para >= 5000m', () => {
      expect(MissDistance.create(5000).isDangerous()).toBe(false)
    })
  })

  describe('isCritical', () => {
    it('retorna true para < 1000m', () => {
      expect(MissDistance.create(999).isCritical()).toBe(true)
    })

    it('retorna false para >= 1000m', () => {
      expect(MissDistance.create(1000).isCritical()).toBe(false)
    })
  })

  describe('toDisplayString', () => {
    it('retorna metros para valores < 1000m', () => {
      expect(MissDistance.create(847).toDisplayString()).toBe('847m')
    })

    it('retorna km com uma casa decimal para >= 1000m', () => {
      expect(MissDistance.create(2300).toDisplayString()).toBe('2.3km')
    })

    it('retorna km para valores exatos', () => {
      expect(MissDistance.create(10000).toDisplayString()).toBe('10.0km')
    })
  })
})
