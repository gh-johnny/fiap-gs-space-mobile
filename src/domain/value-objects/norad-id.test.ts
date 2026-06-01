import { NoradId } from './norad-id'

describe('NoradId', () => {
  describe('create', () => {
    it('retorna instância para id válido', () => {
      const id = NoradId.create(44713)
      expect(id).toBeInstanceOf(NoradId)
    })

    it('lança erro para zero', () => {
      expect(() => NoradId.create(0)).toThrow('NoradId deve ser um inteiro positivo')
    })

    it('lança erro para negativo', () => {
      expect(() => NoradId.create(-1)).toThrow('NoradId deve ser um inteiro positivo')
    })

    it('lança erro para não-inteiro', () => {
      expect(() => NoradId.create(1.5)).toThrow('NoradId deve ser um inteiro positivo')
    })
  })

  describe('toString', () => {
    it('retorna representação string do valor', () => {
      const id = NoradId.create(44713)
      expect(id.toString()).toBe('44713')
    })
  })

  describe('equals', () => {
    it('retorna true para ids com mesmo valor', () => {
      expect(NoradId.create(44713).equals(NoradId.create(44713))).toBe(true)
    })

    it('retorna false para ids diferentes', () => {
      expect(NoradId.create(44713).equals(NoradId.create(25544))).toBe(false)
    })
  })
})
