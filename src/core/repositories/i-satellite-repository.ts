import { SatelliteObject } from '@/core/entities'

export interface ISatelliteRepository {
  findAll(): Promise<SatelliteObject[]>
}
