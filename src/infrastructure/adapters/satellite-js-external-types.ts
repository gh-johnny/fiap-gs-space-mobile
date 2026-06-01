// Tipos externos do satellite.js — nunca importar satellite.js fora deste arquivo

export interface SatRecExternal {
  readonly error: number // 0 = sem erro (SatRecError.None)
  readonly satnum: string
  [key: string]: unknown // opaco — só passamos ao propagate()
}

export interface EciVec3External {
  readonly x: number // km
  readonly y: number // km
  readonly z: number // km
}

export interface GeodeticVec3External {
  readonly longitude: number // radianos
  readonly latitude: number // radianos
  readonly height: number // km
}

export interface PositionAndVelocityExternal {
  readonly position: EciVec3External | false
  readonly velocity: EciVec3External | false
}
