import { TimeToClosestApproach } from './time-to-closest-approach'

function hoursFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000)
}

describe('TimeToClosestApproach', () => {
  describe('create', () => {
    it('retorna instância para data futura', () => {
      expect(TimeToClosestApproach.create(hoursFromNow(5))).toBeInstanceOf(TimeToClosestApproach)
    })

    it('retorna instância para data passada (conjunção já ocorreu)', () => {
      expect(() => TimeToClosestApproach.create(hoursFromNow(-1))).not.toThrow()
    })
  })

  describe('actionWindowIsOpen', () => {
    it('retorna true quando TCPA > 4h', () => {
      expect(TimeToClosestApproach.create(hoursFromNow(5)).actionWindowIsOpen()).toBe(true)
    })

    it('retorna false quando TCPA <= 4h', () => {
      expect(TimeToClosestApproach.create(hoursFromNow(3)).actionWindowIsOpen()).toBe(false)
    })

    it('retorna false quando TCPA = exatamente 4h', () => {
      expect(TimeToClosestApproach.create(hoursFromNow(4)).actionWindowIsOpen()).toBe(false)
    })
  })

  describe('toDisplayString', () => {
    it('formata horas e minutos corretamente', () => {
      const date = new Date(Date.now() + (4 * 60 + 23) * 60 * 1000)
      expect(TimeToClosestApproach.create(date).toDisplayString()).toBe('4h 23min')
    })

    it('formata apenas minutos quando < 1h', () => {
      const date = new Date(Date.now() + 30 * 60 * 1000)
      expect(TimeToClosestApproach.create(date).toDisplayString()).toBe('0h 30min')
    })
  })

  describe('toUtcString', () => {
    it('retorna string no formato "até HH:MM UTC"', () => {
      const date = hoursFromNow(5)
      const result = TimeToClosestApproach.create(date).toUtcString()
      expect(result).toMatch(/^até \d{2}:\d{2} UTC$/)
    })
  })
})
