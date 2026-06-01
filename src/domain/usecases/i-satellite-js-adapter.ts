import { TLEData } from '@/domain/value-objects'
import { OrbitPosition } from './propagate-orbits'

export interface ISatelliteJsAdapter {
  propagate(tle: TLEData, timestamp: Date): OrbitPosition | null
}
