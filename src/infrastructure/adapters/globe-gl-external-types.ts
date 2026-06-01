// Tipos externos do globe.gl — nunca importar globe.gl fora deste arquivo

export interface GlobePointDataExternal {
  readonly lat: number
  readonly lng: number
  readonly alt: number
  readonly color: string
  readonly radius: number
  readonly noradId: number
}

export interface GlobeArcDataExternal {
  readonly startLat: number
  readonly startLng: number
  readonly endLat: number
  readonly endLng: number
  readonly color: string
  readonly stroke: number
}
