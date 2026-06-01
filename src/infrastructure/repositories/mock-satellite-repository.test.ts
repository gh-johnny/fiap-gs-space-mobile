import { MockSatelliteRepository } from './mock-satellite-repository'
import { ITleGateway } from '@/domain/gateways/i-tle-gateway'
import { SatelliteObject, SatelliteObjectType } from '@/domain/entities'
import { NoradId, TLEData } from '@/domain/value-objects'

const L1 = '1 25544U 98067A   21275.51782528  .00005745  00000-0  11227-3 0  9993'
const L2 = '2 25544  51.6441 290.5490 0003799 102.9970 332.5663 15.48862740304656'

function makeSatellite(id: number): SatelliteObject {
  return SatelliteObject.create({
    noradId: NoradId.create(id),
    name: `SAT-${id}`,
    type: SatelliteObjectType.OPERATIONAL_SATELLITE,
    tleData: TLEData.create(L1, L2),
  })
}

function makeGateway(satellites: SatelliteObject[]): jest.Mocked<ITleGateway> {
  return { fetchTLEs: jest.fn().mockResolvedValue(satellites) }
}

describe('MockSatelliteRepository', () => {
  it('findAll() retorna array não vazio de SatelliteObject', async () => {
    const sats = [makeSatellite(25544), makeSatellite(20580)]
    const sut = new MockSatelliteRepository(makeGateway(sats))

    const result = await sut.findAll()

    expect(result.length).toBe(2)
  })

  it('cada objeto tem noradId, name, type e tleData válidos', async () => {
    const sut = new MockSatelliteRepository(makeGateway([makeSatellite(25544)]))

    const [sat] = await sut.findAll()

    expect(sat!.noradId.value).toBe(25544)
    expect(sat!.name).toBe('SAT-25544')
    expect(sat!.type).toBe(SatelliteObjectType.OPERATIONAL_SATELLITE)
    expect(sat!.tleData.line1).toMatch(/^1 /)
  })

  it('findAll() delega ao ITleGateway', async () => {
    const gateway = makeGateway([makeSatellite(25544)])
    const sut = new MockSatelliteRepository(gateway)

    await sut.findAll()

    expect(gateway.fetchTLEs).toHaveBeenCalledTimes(1)
  })
})
