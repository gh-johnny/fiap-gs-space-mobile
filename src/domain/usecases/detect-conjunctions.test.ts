import { NoradId, TLEData } from '@/domain/value-objects'
import { SatelliteObject, SatelliteObjectType } from '@/domain/entities'
import { DetectConjunctions } from './detect-conjunctions'
import { OrbitPosition } from './propagate-orbits'

const VALID_LINE1 = '1 25544U 98067A   24001.50000000  .00001234  00000-0  12345-4 0  9999'
const VALID_LINE2 = '2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.50377579123456'

const makeSat = (id: number) =>
  SatelliteObject.create({
    noradId: NoradId.create(id),
    name: `SAT-${id}`,
    tleData: TLEData.create(VALID_LINE1, VALID_LINE2),
    type: SatelliteObjectType.OPERATIONAL_SATELLITE,
  })

const makePos = (id: number, lat: number, lng: number, alt: number): OrbitPosition => ({
  noradId: NoradId.create(id),
  lat,
  lng,
  alt,
})

describe('DetectConjunctions', () => {
  const useCase = new DetectConjunctions()

  it('retorna array vazio quando há menos de 2 posições', () => {
    const sat = makeSat(1)
    const result = useCase.execute([sat], [makePos(1, 0, 0, 400)])
    expect(result).toEqual([])
  })

  it('retorna array vazio quando lista está vazia', () => {
    expect(useCase.execute([], [])).toEqual([])
  })

  it('gera ConjunctionEvent para dois objetos a menos de 50km', () => {
    const sat1 = makeSat(25544)
    const sat2 = makeSat(20580)
    const positions = [
      makePos(25544, 0, 0, 400),
      makePos(20580, 0.001, 0.001, 400), // ~200m de separação
    ]

    const result = useCase.execute([sat1, sat2], positions)

    expect(result.length).toBeGreaterThanOrEqual(1)
    const ids = [result[0]!.objectA.noradId.value, result[0]!.objectB.noradId.value]
    expect(ids).toContain(25544)
    expect(ids).toContain(20580)
  })

  it('não gera evento para dois objetos a mais de 50km', () => {
    const sat1 = makeSat(1)
    const sat2 = makeSat(2)
    // ~555km de separação (5 graus de latitude)
    const positions = [makePos(1, 0, 0, 400), makePos(2, 5, 0, 400)]

    const result = useCase.execute([sat1, sat2], positions)

    expect(result).toHaveLength(0)
  })

  it('gera apenas 1 evento para 3 objetos onde apenas 1 par está próximo', () => {
    const sats = [makeSat(1), makeSat(2), makeSat(3)]
    const positions = [
      makePos(1, 0, 0, 400),
      makePos(2, 0.001, 0.001, 400), // próximo ao 1
      makePos(3, 10, 10, 400),        // longe de ambos
    ]

    const result = useCase.execute(sats, positions)

    expect(result).toHaveLength(1)
  })

  it('ordena eventos CRITICAL antes de INFO', () => {
    const sats = [makeSat(1), makeSat(2), makeSat(3), makeSat(4)]
    const positions = [
      makePos(1, 0, 0, 400),
      makePos(2, 0.0001, 0.0001, 400), // ~20m → CRITICAL
      makePos(3, 0, 0.39, 400),         // ~43km → INFO
      makePos(4, 0, 0.391, 400),        // próximo ao 3 → INFO
    ]

    const result = useCase.execute(sats, positions)

    expect(result.length).toBeGreaterThanOrEqual(2)
    const severities = result.map((e) => e.severity)
    const order = ['CRITICAL', 'WARNING', 'INFO']
    const sorted = [...severities].sort(
      (a, b) => order.indexOf(a) - order.indexOf(b),
    )
    expect(severities).toEqual(sorted)
  })

  it('ignora satélites sem posição correspondente', () => {
    const sat1 = makeSat(1)
    const sat2 = makeSat(2)
    const sat3 = makeSat(3) // sem posição
    const positions = [makePos(1, 0, 0, 400), makePos(2, 0.001, 0, 400)]

    const result = useCase.execute([sat1, sat2, sat3], positions)

    const eventIds = result.flatMap((e) => [e.objectA.noradId.value, e.objectB.noradId.value])
    expect(eventIds).not.toContain(3)
  })

  it('ignora posições sem satélite correspondente no mapa (branch !satA || !satB)', () => {
    const sat1 = makeSat(1)
    // posição 99 não tem satélite no array
    const positions = [makePos(1, 0, 0, 400), makePos(99, 0.001, 0.001, 400)]

    const result = useCase.execute([sat1], positions)

    // nenhum evento — o par (1, 99) não acha satélite para id=99
    expect(result).toHaveLength(0)
  })
})
