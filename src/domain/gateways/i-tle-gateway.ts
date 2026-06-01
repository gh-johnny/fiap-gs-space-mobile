import { SatelliteObject } from '@/domain/entities'

export interface ITleGateway {
  fetchTLEs(): Promise<SatelliteObject[]>
}
