import { ISatelliteRepository } from '@/core/repositories/i-satellite-repository'
import { ITleGateway } from '@/core/gateways/i-tle-gateway'
import { SatelliteObject } from '@/core/entities'

export class MockSatelliteRepository implements ISatelliteRepository {
  constructor(private readonly tleGateway: ITleGateway) {}

  findAll(): Promise<SatelliteObject[]> {
    return this.tleGateway.fetchTLEs()
  }
}
