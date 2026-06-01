import { NoradId } from '@/domain/value-objects'
import { SatelliteObject } from '@/domain/entities'
import { ISatelliteJsAdapter } from './i-satellite-js-adapter'

export interface OrbitPosition {
  noradId: NoradId
  lat: number
  lng: number
  alt: number
}

export class PropagateOrbits {
  constructor(private readonly adapter: ISatelliteJsAdapter) {}

  execute(satellites: SatelliteObject[], timestamp: Date): OrbitPosition[] {
    const positions: OrbitPosition[] = []

    for (const satellite of satellites) {
      const position = this.adapter.propagate(satellite.tleData, timestamp)
      if (position !== null) {
        positions.push(position)
      }
    }

    return positions
  }
}
