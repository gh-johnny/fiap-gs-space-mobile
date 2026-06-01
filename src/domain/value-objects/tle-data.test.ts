import { TLEData } from './tle-data'

const VALID_LINE1 = '1 44713U 19074A   20325.51612742  .00000078  00000-0  24334-4 0  9993'
const VALID_LINE2 = '2 44713  53.0538 344.4309 0001318  94.1468 265.9876 15.06380308 57224'

describe('TLEData', () => {
  describe('create', () => {
    it('retorna instância para linhas válidas', () => {
      const tle = TLEData.create(VALID_LINE1, VALID_LINE2)
      expect(tle).toBeInstanceOf(TLEData)
    })

    it('lança erro se line1 tiver comprimento diferente de 69', () => {
      expect(() => TLEData.create('curta', VALID_LINE2)).toThrow('TLE line1 deve ter 69 caracteres')
    })

    it('lança erro se line2 tiver comprimento diferente de 69', () => {
      expect(() => TLEData.create(VALID_LINE1, 'curta')).toThrow('TLE line2 deve ter 69 caracteres')
    })

    it('expõe line1 e line2 como readonly', () => {
      const tle = TLEData.create(VALID_LINE1, VALID_LINE2)
      expect(tle.line1).toBe(VALID_LINE1)
      expect(tle.line2).toBe(VALID_LINE2)
    })
  })

  describe('isExpired', () => {
    it('retorna false para TLE com epoch recente', () => {
      const recentLine1 = `1 44713U 19074A   ${formatEpoch(new Date())}  .00000078  00000-0  24334-4 0  9993`
      const tle = TLEData.create(recentLine1.padEnd(69), VALID_LINE2)
      expect(tle.isExpired()).toBe(false)
    })

    it('retorna true para TLE com epoch de 20 dias atrás', () => {
      const old = new Date()
      old.setDate(old.getDate() - 20)
      const oldLine1 = `1 44713U 19074A   ${formatEpoch(old)}  .00000078  00000-0  24334-4 0  9993`
      const tle = TLEData.create(oldLine1.padEnd(69), VALID_LINE2)
      expect(tle.isExpired()).toBe(true)
    })

    it('interpreta epoch year >= 57 como século 1900 (satélites históricos)', () => {
      // epoch 98001.00000000 = 1 jan 1998 — mais de 14 dias atrás, logo expirado
      const l1 = '1 44713U 19074A   98001.00000000  .00000078  00000-0  24334-4 0  9993'
      const tle = TLEData.create(l1.padEnd(69), VALID_LINE2)
      expect(tle.isExpired()).toBe(true)
    })
  })
})

function formatEpoch(date: Date): string {
  const year = date.getUTCFullYear() % 100
  const start = Date.UTC(date.getUTCFullYear(), 0, 0)
  const dayOfYear = (date.getTime() - start) / 86400000
  return `${String(year).padStart(2, '0')}${dayOfYear.toFixed(8).padStart(12, '0')}`
}
