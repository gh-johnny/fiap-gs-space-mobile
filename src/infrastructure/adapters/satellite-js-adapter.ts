import { twoline2satrec, propagate, eciToGeodetic, gstime } from 'satellite.js'
import { TLEData, NoradId } from '@/core/value-objects'
import { ISatelliteJsAdapter } from '@/core/usecases/i-satellite-js-adapter'
import { OrbitPosition } from '@/core/usecases/propagate-orbits'
import type {
  SatRecExternal,
  EciVec3External,
  GeodeticVec3External,
} from './satellite-js-external-types'

const RAD_TO_DEG = 180 / Math.PI

export class SatelliteJsAdapter implements ISatelliteJsAdapter {
  propagate(tle: TLEData, timestamp: Date): OrbitPosition | null {
    try {
      const satrec = twoline2satrec(tle.line1, tle.line2) as unknown as SatRecExternal
      if (satrec.error !== 0) return null

      const pv = propagate(satrec as never, timestamp)
      const position = pv.position as EciVec3External | false
      if (!position || typeof position.x !== 'number') return null

      const gmst = gstime(timestamp)
      const geo = eciToGeodetic(position as never, gmst) as unknown as GeodeticVec3External

      return {
        noradId: NoradId.create(parseInt(satrec.satnum, 10)),
        lat: geo.latitude * RAD_TO_DEG,
        lng: geo.longitude * RAD_TO_DEG,
        alt: geo.height,
      }
    } catch {
      return null
    }
  }
}
