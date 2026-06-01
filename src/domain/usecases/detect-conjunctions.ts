import {
  ProbabilityOfCollision,
  MissDistance,
  TimeToClosestApproach,
  type Severity,
} from '@/domain/value-objects'
import { SatelliteObject, ConjunctionEvent } from '@/domain/entities'
import { OrbitPosition } from './propagate-orbits'

const MAX_CONJUNCTION_DISTANCE_KM = 50
const EARTH_RADIUS_KM = 6371

const SEVERITY_ORDER: Record<Severity, number> = {
  CRITICAL: 0,
  WARNING: 1,
  INFO: 2,
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180
}

function distanceKm(a: OrbitPosition, b: OrbitPosition): number {
  const latA = toRadians(a.lat)
  const latB = toRadians(b.lat)
  const dlat = latB - latA
  const dlng = toRadians(b.lng - a.lng)
  const dalt = b.alt - a.alt

  const haversine =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(latA) * Math.cos(latB) * Math.sin(dlng / 2) ** 2
  const surfaceKm =
    2 * (EARTH_RADIUS_KM + (a.alt + b.alt) / 2) * Math.asin(Math.sqrt(haversine))

  return Math.sqrt(surfaceKm ** 2 + dalt ** 2)
}

function pcFromDistance(distanceKm: number): ProbabilityOfCollision {
  // Pc proporcional à distância: < 1km → CRITICAL, 1-5km → WARNING, >5km → INFO
  const distanceM = distanceKm * 1000
  if (distanceM < 500) return ProbabilityOfCollision.create(5e-4)
  if (distanceM < 5000) return ProbabilityOfCollision.create(5e-5)
  return ProbabilityOfCollision.create(5e-6)
}

function tcpaFromNow(offsetMinutes: number): TimeToClosestApproach {
  const date = new Date(Date.now() + offsetMinutes * 60_000)
  return TimeToClosestApproach.create(date)
}

export class DetectConjunctions {
  execute(
    satellites: SatelliteObject[],
    positions: OrbitPosition[],
  ): ConjunctionEvent[] {
    if (positions.length < 2) return []

    const satelliteByNoradId = new Map<number, SatelliteObject>()
    for (const sat of satellites) {
      satelliteByNoradId.set(sat.noradId.value, sat)
    }

    const events: ConjunctionEvent[] = []

    for (let i = 0; i < positions.length - 1; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const posA = positions[i]!
        const posB = positions[j]!
        const km = distanceKm(posA, posB)

        if (km >= MAX_CONJUNCTION_DISTANCE_KM) continue

        const satA = satelliteByNoradId.get(posA.noradId.value)
        const satB = satelliteByNoradId.get(posB.noradId.value)
        if (!satA || !satB) continue

        const pc = pcFromDistance(km)
        const missDistM = km * 1000
        const missDistance = MissDistance.create(missDistM)
        const tcpa = tcpaFromNow(30 + Math.round(Math.random() * 90))

        events.push(
          ConjunctionEvent.create({ objectA: satA, objectB: satB, pc, missDistance, tcpa }),
        )
      }
    }

    return events.sort(
      (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
    )
  }
}
