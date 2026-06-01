import { create } from 'zustand'
import { SatelliteObject } from '@/domain/entities'
import { ISatelliteRepository } from '@/domain/repositories/i-satellite-repository'
import { PropagateOrbits, type OrbitPosition } from '@/domain/usecases/propagate-orbits'

interface OrbitalState {
  satellites: SatelliteObject[]
  positions: OrbitPosition[]
  isLoading: boolean
  loadSatellites: (repo: ISatelliteRepository) => Promise<void>
  propagatePositions: (useCase: PropagateOrbits, timestamp: Date) => void
  reset: () => void
}

export const useOrbitalStore = create<OrbitalState>((set, get) => ({
  satellites: [],
  positions: [],
  isLoading: false,

  async loadSatellites(repo) {
    set({ isLoading: true })
    const satellites = await repo.findAll()
    set({ satellites, isLoading: false })
  },

  propagatePositions(useCase, timestamp) {
    const { satellites } = get()
    const positions = useCase.execute(satellites, timestamp)
    set({ positions })
  },

  reset() {
    set({ satellites: [], positions: [], isLoading: false })
  },
}))
