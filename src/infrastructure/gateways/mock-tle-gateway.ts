import { ITleGateway } from '@/domain/gateways/i-tle-gateway'
import { SatelliteObject, SatelliteObjectType } from '@/domain/entities'
import { NoradId, TLEData } from '@/domain/value-objects'
import type { TleRecordExternal } from './tle-record-external'
import tlesJson from '@/data/tles.json'

const TYPE_MAP: Record<string, SatelliteObjectType> = {
  OPERATIONAL_SATELLITE: SatelliteObjectType.OPERATIONAL_SATELLITE,
  DEBRIS: SatelliteObjectType.DEBRIS,
  ROCKET_BODY: SatelliteObjectType.ROCKET_BODY,
}

export class MockTleGateway implements ITleGateway {
  async fetchTLEs(): Promise<SatelliteObject[]> {
    const records = tlesJson as TleRecordExternal[]

    return records.reduce<SatelliteObject[]>((acc, record) => {
      try {
        const satellite = SatelliteObject.create({
          noradId: NoradId.create(record.noradId),
          name: record.name,
          type: TYPE_MAP[record.type] ?? SatelliteObjectType.DEBRIS,
          tleData: TLEData.create(record.line1, record.line2),
        })
        acc.push(satellite)
      } catch {
        // descarta registros malformados silenciosamente
      }
      return acc
    }, [])
  }
}
