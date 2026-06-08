import { act, renderHook } from '@testing-library/react-native'
import { useOrbitalStore } from './use-orbital-store'
import { SatelliteObject, SatelliteObjectType } from '@/core/entities'
import { NoradId, TLEData } from '@/core/value-objects'
import { ISatelliteRepository } from '@/core/repositories/i-satellite-repository'
import { PropagateOrbits } from '@/core/usecases/propagate-orbits'
import type { OrbitPosition } from '@/core/usecases/propagate-orbits'

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

function makePosition(id: number): OrbitPosition {
  return { noradId: NoradId.create(id), lat: 10, lng: 20, alt: 400 }
}

function makeDeps(sats: SatelliteObject[], positions: OrbitPosition[]) {
  const repo: jest.Mocked<ISatelliteRepository> = {
    findAll: jest.fn().mockResolvedValue(sats),
  }
  const propagate: jest.Mocked<PropagateOrbits> = {
    execute: jest.fn().mockReturnValue(positions),
  } as unknown as jest.Mocked<PropagateOrbits>
  return { repo, propagate }
}

describe('useOrbitalStore', () => {
  beforeEach(() => {
    useOrbitalStore.getState().reset()
  })

  it('loadSatellites() popula satellites', async () => {
    const sats = [makeSatellite(25544)]
    const { repo, propagate } = makeDeps(sats, [])

    const { result } = renderHook(() => useOrbitalStore())
    await act(async () => {
      await result.current.loadSatellites(repo)
    })

    expect(result.current.satellites).toHaveLength(1)
    expect(result.current.satellites[0]!.noradId.value).toBe(25544)
    void propagate // satisfies ts
  })

  it('propagatePositions() popula positions', async () => {
    const sats = [makeSatellite(25544)]
    const pos = [makePosition(25544)]
    const { repo, propagate } = makeDeps(sats, pos)

    const { result } = renderHook(() => useOrbitalStore())
    await act(async () => {
      await result.current.loadSatellites(repo)
      result.current.propagatePositions(propagate, new Date())
    })

    expect(result.current.positions).toHaveLength(1)
  })

  it('isLoading é true durante e false após loadSatellites()', async () => {
    const { repo, propagate } = makeDeps([makeSatellite(25544)], [])
    let loadingDuring = false

    const { result } = renderHook(() => useOrbitalStore())
    await act(async () => {
      const promise = result.current.loadSatellites(repo)
      // lê direto do store (sem aguardar re-render do hook)
      loadingDuring = useOrbitalStore.getState().isLoading
      await promise
    })

    expect(loadingDuring).toBe(true)
    expect(result.current.isLoading).toBe(false)
    void propagate
  })
})
