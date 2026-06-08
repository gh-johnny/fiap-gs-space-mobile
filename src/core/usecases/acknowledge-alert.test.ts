import { AcknowledgeAlert } from './acknowledge-alert'
import { OrbitalAlert } from '@/core/entities/orbital-alert'
import { ConjunctionEvent } from '@/core/entities/conjunction-event'
import { SatelliteObject, SatelliteObjectType } from '@/core/entities/satellite-object'
import {
  NoradId,
  TLEData,
  ProbabilityOfCollision,
  MissDistance,
  TimeToClosestApproach,
} from '@/core/value-objects'
import { IStorageGateway } from '@/core/gateways/i-storage-gateway'
import { IAlertHistoryRepository } from '@/core/repositories/i-alert-history-repository'

const L1 = '1 44713U 19074A   20325.51612742  .00000078  00000-0  24334-4 0  9993'
const L2 = '2 44713  53.0538 344.4309 0001318  94.1468 265.9876 15.06380308 57224'
const L1B = '1 25544U 98067A   20325.51612742  .00002182  00000-0  46379-4 0  9993'
const L2B = '2 25544  51.6442  15.5932 0001470 352.8472 164.5957 15.49215693254837'

function makeAlert(): OrbitalAlert {
  const makeSat = (id: number, name: string) =>
    SatelliteObject.create({
      noradId: NoradId.create(id),
      name,
      type: SatelliteObjectType.OPERATIONAL_SATELLITE,
      tleData: TLEData.create(id === 44713 ? L1 : L1B, id === 44713 ? L2 : L2B),
    })

  const event = ConjunctionEvent.create({
    objectA: makeSat(44713, 'STARLINK-1007'),
    objectB: makeSat(25544, 'ISS'),
    pc: ProbabilityOfCollision.create(1.4e-3),
    missDistance: MissDistance.create(847),
    tcpa: TimeToClosestApproach.create(new Date(Date.now() + 5 * 3600 * 1000)),
  })

  return OrbitalAlert.create(event)
}

function makeStorageGateway(): jest.Mocked<IStorageGateway> {
  return { get: jest.fn(), set: jest.fn(), remove: jest.fn() }
}

function makeAlertHistoryRepository(): jest.Mocked<IAlertHistoryRepository> {
  return {
    save: jest.fn().mockResolvedValue(undefined),
    findAll: jest.fn().mockResolvedValue([]),
    findByStatus: jest.fn().mockResolvedValue([]),
  }
}

describe('AcknowledgeAlert', () => {
  it('retorna OrbitalAlert com status acknowledged', async () => {
    const alert = makeAlert()
    const sut = new AcknowledgeAlert(makeStorageGateway(), makeAlertHistoryRepository())

    const result = await sut.execute(alert)

    expect(result.status).toBe('acknowledged')
  })

  it('retorna nova instância (imutabilidade)', async () => {
    const alert = makeAlert()
    const sut = new AcknowledgeAlert(makeStorageGateway(), makeAlertHistoryRepository())

    const result = await sut.execute(alert)

    expect(result).not.toBe(alert)
    expect(alert.status).toBe('detected')
  })

  it('chama storageGateway.set com chave correta e alert acknowledged', async () => {
    const alert = makeAlert()
    const storage = makeStorageGateway()
    const sut = new AcknowledgeAlert(storage, makeAlertHistoryRepository())

    const result = await sut.execute(alert)

    expect(storage.set).toHaveBeenCalledTimes(1)
    expect(storage.set).toHaveBeenCalledWith(`alert:${alert.id}`, result)
  })

  it('chama alertHistoryRepository.save com o alert acknowledged', async () => {
    const alert = makeAlert()
    const repo = makeAlertHistoryRepository()
    const sut = new AcknowledgeAlert(makeStorageGateway(), repo)

    const result = await sut.execute(alert)

    expect(repo.save).toHaveBeenCalledTimes(1)
    expect(repo.save).toHaveBeenCalledWith(result)
  })
})
