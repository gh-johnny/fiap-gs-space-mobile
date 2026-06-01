import { act, renderHook } from '@testing-library/react-native'
import { useAlertStore } from './use-alert-store'
import { ConjunctionEvent, OrbitalAlert, SatelliteObject, SatelliteObjectType } from '@/domain/entities'
import {
  NoradId,
  TLEData,
  ProbabilityOfCollision,
  MissDistance,
  TimeToClosestApproach,
} from '@/domain/value-objects'
import { IConjunctionRepository } from '@/domain/repositories/i-conjunction-repository'
import { IAlertHistoryRepository } from '@/domain/repositories/i-alert-history-repository'
import { AcknowledgeAlert } from '@/domain/usecases/acknowledge-alert'

const L1 = '1 25544U 98067A   21275.51782528  .00005745  00000-0  11227-3 0  9993'
const L2 = '2 25544  51.6441 290.5490 0003799 102.9970 332.5663 15.48862740304656'
const L1B = '1 44713U 19074A   21275.51612742  .00000078  00000-0  24334-4 0  9993'
const L2B = '2 44713  53.0538 344.4309 0001318  94.1468 265.9876 15.06380308 57224'

function makeEvent(pc: number, miss: number): ConjunctionEvent {
  return ConjunctionEvent.create({
    objectA: SatelliteObject.create({
      noradId: NoradId.create(25544),
      name: 'ISS',
      type: SatelliteObjectType.OPERATIONAL_SATELLITE,
      tleData: TLEData.create(L1, L2),
    }),
    objectB: SatelliteObject.create({
      noradId: NoradId.create(44713),
      name: 'STARLINK-1007',
      type: SatelliteObjectType.OPERATIONAL_SATELLITE,
      tleData: TLEData.create(L1B, L2B),
    }),
    pc: ProbabilityOfCollision.create(pc),
    missDistance: MissDistance.create(miss),
    tcpa: TimeToClosestApproach.create(new Date(Date.now() + 3600_000)),
  })
}

const criticalEvent = makeEvent(5e-4, 420) // CRITICAL
const warningEvent = makeEvent(5e-5, 2800) // WARNING

function makeConjunctionRepo(events: ConjunctionEvent[]): jest.Mocked<IConjunctionRepository> {
  return {
    findAll: jest.fn().mockResolvedValue(events),
    findBySeverity: jest.fn().mockResolvedValue([]),
  }
}

function makeAlertHistoryRepo(alerts: OrbitalAlert[] = []): jest.Mocked<IAlertHistoryRepository> {
  return {
    findAll: jest.fn().mockResolvedValue(alerts),
    save: jest.fn().mockResolvedValue(undefined),
    findByStatus: jest.fn().mockResolvedValue([]),
  }
}

function makeAcknowledgeUseCase(): jest.Mocked<AcknowledgeAlert> {
  return {
    execute: jest.fn().mockImplementation((alert: OrbitalAlert) =>
      Promise.resolve(alert.acknowledge()),
    ),
  } as unknown as jest.Mocked<AcknowledgeAlert>
}

describe('useAlertStore', () => {
  beforeEach(() => {
    useAlertStore.getState().reset()
  })

  it('loadConjunctions() popula conjunctions', async () => {
    const repo = makeConjunctionRepo([criticalEvent, warningEvent])
    const { result } = renderHook(() => useAlertStore())

    await act(async () => {
      await result.current.loadConjunctions(repo)
    })

    expect(result.current.conjunctions).toHaveLength(2)
  })

  it('loadAlertHistory() popula alertHistory via IAlertHistoryRepository', async () => {
    const alert = OrbitalAlert.create(criticalEvent)
    const repo = makeAlertHistoryRepo([alert])
    const { result } = renderHook(() => useAlertStore())

    await act(async () => {
      await result.current.loadAlertHistory(repo)
    })

    expect(result.current.alertHistory).toHaveLength(1)
  })

  it('triggerAlert() seta activeAlert com primeira conjunção CRITICAL', async () => {
    const conjRepo = makeConjunctionRepo([criticalEvent, warningEvent])
    const { result } = renderHook(() => useAlertStore())

    await act(async () => {
      await result.current.loadConjunctions(conjRepo)
      result.current.triggerAlert()
    })

    expect(result.current.activeAlert).not.toBeNull()
    expect(result.current.activeAlert!.conjunctionEvent.severity).toBe('CRITICAL')
  })

  it('acknowledgeCurrentAlert() chama use case e persiste via mock', async () => {
    const conjRepo = makeConjunctionRepo([criticalEvent])
    const acknowledgeUseCase = makeAcknowledgeUseCase()
    const { result } = renderHook(() => useAlertStore())

    await act(async () => {
      await result.current.loadConjunctions(conjRepo)
      result.current.triggerAlert()
      await result.current.acknowledgeCurrentAlert(acknowledgeUseCase)
    })

    expect(acknowledgeUseCase.execute).toHaveBeenCalledTimes(1)
  })

  it('dismissAlert() seta activeAlert para null', async () => {
    const conjRepo = makeConjunctionRepo([criticalEvent])
    const { result } = renderHook(() => useAlertStore())

    await act(async () => {
      await result.current.loadConjunctions(conjRepo)
      result.current.triggerAlert()
      result.current.dismissAlert()
    })

    expect(result.current.activeAlert).toBeNull()
  })
})
