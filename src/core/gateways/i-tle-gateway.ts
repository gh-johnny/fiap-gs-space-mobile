import { SatelliteObject } from '@/core/entities'

export interface ITleGateway {
  fetchTLEs(): Promise<SatelliteObject[]>
}
