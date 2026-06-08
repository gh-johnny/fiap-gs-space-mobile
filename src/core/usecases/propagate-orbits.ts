import { NoradId } from '@/core/value-objects'
import { SatelliteObject } from '@/core/entities'
import { ISatelliteJsAdapter } from './i-satellite-js-adapter'

export interface OrbitPosition {
  noradId: NoradId
  lat: number
  lng: number
  alt: number
  satType?: string
}

export class PropagateOrbits {
  constructor(private readonly adapter: ISatelliteJsAdapter) {}

  execute(satellites: SatelliteObject[], timestamp: Date): OrbitPosition[] {
    const positions: OrbitPosition[] = []

    for (const satellite of satellites) {
      const position = this.adapter.propagate(satellite.tleData, timestamp)
      if (position !== null) {
        positions.push({ ...position, satType: satellite.type })
      }
    }

    return positions
  }
}
