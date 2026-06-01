import { NoradId, TLEData } from '@/domain/value-objects'
import { SatelliteObject, SatelliteObjectType } from '@/domain/entities'
import { PropagateOrbits, OrbitPosition } from './propagate-orbits'
import { ISatelliteJsAdapter } from './i-satellite-js-adapter'

const makeValidTle = (): TLEData =>
  TLEData.create(
    '1 25544U 98067A   24001.50000000  .00001234  00000-0  12345-4 0  9999',
    '2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.50377579123456',
  )

const makeSatellite = (noradId: number) =>
  SatelliteObject.create({
    noradId: NoradId.create(noradId),
    name: `SAT-${noradId}`,
    tleData: makeValidTle(),
    type: SatelliteObjectType.OPERATIONAL_SATELLITE,
  })

const makePosition = (noradId: number): OrbitPosition => ({
  noradId: NoradId.create(noradId),
  lat: -23.5,
  lng: -46.6,
  alt: 420,
})

const makeMockAdapter = (
  impl?: Partial<ISatelliteJsAdapter>,
): ISatelliteJsAdapter => ({
  propagate: jest.fn().mockReturnValue(null),
  ...impl,
})

describe('PropagateOrbits', () => {
  const refDate = new Date('2024-01-01T12:00:00Z')

  it('chama adapter.propagate para cada satélite', () => {
    const sat1 = makeSatellite(25544)
    const sat2 = makeSatellite(20580)
    const adapter = makeMockAdapter({
      propagate: jest.fn().mockReturnValue(null),
    })
    const useCase = new PropagateOrbits(adapter)

    useCase.execute([sat1, sat2], refDate)

    expect(adapter.propagate).toHaveBeenCalledTimes(2)
    expect(adapter.propagate).toHaveBeenCalledWith(sat1.tleData, refDate)
    expect(adapter.propagate).toHaveBeenCalledWith(sat2.tleData, refDate)
  })

  it('filtra posições null retornadas pelo adapter', () => {
    const sat1 = makeSatellite(25544)
    const sat2 = makeSatellite(20580)
    const pos1 = makePosition(25544)
    const adapter = makeMockAdapter({
      propagate: jest
        .fn()
        .mockReturnValueOnce(pos1)
        .mockReturnValueOnce(null),
    })
    const useCase = new PropagateOrbits(adapter)

    const result = useCase.execute([sat1, sat2], refDate)

    expect(result).toHaveLength(1)
    expect(result[0]).toBe(pos1)
  })

  it('retorna array vazio quando todos os adapters retornam null', () => {
    const sat = makeSatellite(25544)
    const adapter = makeMockAdapter({ propagate: jest.fn().mockReturnValue(null) })
    const useCase = new PropagateOrbits(adapter)

    const result = useCase.execute([sat], refDate)

    expect(result).toEqual([])
  })

  it('retorna OrbitPosition[] com noradId, lat, lng, alt quando adapter retorna dados', () => {
    const sat = makeSatellite(25544)
    const expected = makePosition(25544)
    const adapter = makeMockAdapter({ propagate: jest.fn().mockReturnValue(expected) })
    const useCase = new PropagateOrbits(adapter)

    const result = useCase.execute([sat], refDate)

    expect(result).toHaveLength(1)
    expect(result[0]!.noradId.value).toBe(25544)
    expect(result[0]!.lat).toBe(-23.5)
    expect(result[0]!.lng).toBe(-46.6)
    expect(result[0]!.alt).toBe(420)
  })

  it('retorna array vazio quando lista de satélites é vazia', () => {
    const adapter = makeMockAdapter()
    const useCase = new PropagateOrbits(adapter)

    const result = useCase.execute([], refDate)

    expect(result).toEqual([])
    expect(adapter.propagate).not.toHaveBeenCalled()
  })
})
