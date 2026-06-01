// Tipo externo que espelha cada entrada do arquivo data/tles.json

export interface TleRecordExternal {
  readonly noradId: number
  readonly name: string
  readonly type: string // 'OPERATIONAL_SATELLITE' | 'DEBRIS' | 'ROCKET_BODY' — string bruta do JSON
  readonly line1: string
  readonly line2: string
}
