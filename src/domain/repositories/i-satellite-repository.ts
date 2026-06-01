import { SatelliteObject } from '@/domain/entities'

export interface ISatelliteRepository {
  findAll(): Promise<SatelliteObject[]>
}
