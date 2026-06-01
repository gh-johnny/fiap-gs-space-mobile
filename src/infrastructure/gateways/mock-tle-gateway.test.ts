import { MockTleGateway } from './mock-tle-gateway'
import { SatelliteObjectType } from '@/domain/entities'

describe('MockTleGateway', () => {
  const sut = new MockTleGateway()

  it('fetchTLEs() retorna array não vazio', async () => {
    const result = await sut.fetchTLEs()
    expect(result.length).toBeGreaterThan(0)
  })

  it('todos os SatelliteObject têm tleData com line1 e line2 válidos', async () => {
    const result = await sut.fetchTLEs()
    for (const sat of result) {
      expect(sat.tleData.line1).toMatch(/^1 /)
      expect(sat.tleData.line2).toMatch(/^2 /)
    }
  })

  it('todos os SatelliteObject têm noradId válido', async () => {
    const result = await sut.fetchTLEs()
    for (const sat of result) {
      expect(sat.noradId.value).toBeGreaterThan(0)
    }
  })

  it('contém pelo menos 3 entradas DEBRIS', async () => {
    const result = await sut.fetchTLEs()
    const debris = result.filter((s) => s.type === SatelliteObjectType.DEBRIS)
    expect(debris.length).toBeGreaterThanOrEqual(3)
  })
})
