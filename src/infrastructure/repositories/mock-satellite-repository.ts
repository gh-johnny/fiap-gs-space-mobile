import { ISatelliteRepository } from '@/domain/repositories/i-satellite-repository'
import { ITleGateway } from '@/domain/gateways/i-tle-gateway'
import { SatelliteObject } from '@/domain/entities'

export class MockSatelliteRepository implements ISatelliteRepository {
  constructor(private readonly tleGateway: ITleGateway) {}

  findAll(): Promise<SatelliteObject[]> {
    return this.tleGateway.fetchTLEs()
  }
}
