import { NoradId, TLEData } from '@/domain/value-objects'

export enum SatelliteObjectType {
  OPERATIONAL_SATELLITE = 'OPERATIONAL_SATELLITE',
  DEBRIS = 'DEBRIS',
  ROCKET_BODY = 'ROCKET_BODY',
}

export class SatelliteObject {
  private constructor(
    readonly noradId: NoradId,
    readonly name: string,
    readonly type: SatelliteObjectType,
    readonly tleData: TLEData,
  ) {}

  static create(params: {
    noradId: NoradId
    name: string
    type: SatelliteObjectType
    tleData: TLEData
  }): SatelliteObject {
    if (!params.name.trim()) {
      throw new Error('SatelliteObject requer um nome não vazio')
    }
    return new SatelliteObject(params.noradId, params.name, params.type, params.tleData)
  }
}
