import { SqliteAlertHistoryRepository } from './sqlite-alert-history-repository'
import { SqliteService } from './sqlite-service'
import { OrbitalAlert } from '@/domain/entities/orbital-alert'
import { ConjunctionEvent } from '@/domain/entities/conjunction-event'
import { SatelliteObject, SatelliteObjectType } from '@/domain/entities/satellite-object'
import {
  NoradId,
  TLEData,
  ProbabilityOfCollision,
  MissDistance,
  TimeToClosestApproach,
} from '@/domain/value-objects'
import type { SqliteAlertRowExternal } from './sqlite-external-types'

const L1 = '1 25544U 98067A   21275.51782528  .00005745  00000-0  11227-3 0  9993'
const L2 = '2 25544  51.6441 290.5490 0003799 102.9970 332.5663 15.48862740304656'
const L1B = '1 44713U 19074A   21275.51612742  .00000078  00000-0  24334-4 0  9993'
const L2B = '2 44713  53.0538 344.4309 0001318  94.1468 265.9876 15.06380308 57224'

function makeAlert(acknowledge = false): OrbitalAlert {
  const event = ConjunctionEvent.create({
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
    pc: ProbabilityOfCollision.create(5e-4),
    missDistance: MissDistance.create(420),
    tcpa: TimeToClosestApproach.create(new Date(Date.now() + 3600_000)),
  })
  const alert = OrbitalAlert.create(event)
  return acknowledge ? alert.acknowledge() : alert
}

function makeRow(alert: OrbitalAlert): SqliteAlertRowExternal {
  return {
    id: alert.id,
    conjunction_event_json: JSON.stringify(alert.conjunctionEvent),
    status: alert.status,
    detected_at: alert.detectedAt.toISOString(),
  }
}

function makeSqliteService(rows: SqliteAlertRowExternal[] = []): jest.Mocked<SqliteService> {
  const db = {
    runSync: jest.fn().mockReturnValue({ lastInsertRowId: 0, changes: 1 }),
    getAllSync: jest.fn().mockReturnValue(rows),
  }
  return {
    getDb: jest.fn().mockReturnValue(db),
  } as unknown as jest.Mocked<SqliteService>
}

describe('SqliteAlertHistoryRepository', () => {
  describe('save', () => {
    it('persiste um alert detectado', async () => {
      const alert = makeAlert()
      const service = makeSqliteService()
      const sut = new SqliteAlertHistoryRepository(service)

      await sut.save(alert)

      const db = service.getDb()
      expect(db.runSync).toHaveBeenCalledTimes(1)
    })

    it('persiste com status acknowledged', async () => {
      const alert = makeAlert(true)
      const service = makeSqliteService()
      const sut = new SqliteAlertHistoryRepository(service)

      await sut.save(alert)

      const db = service.getDb()
      const [sql, params] = (db.runSync as jest.Mock).mock.calls[0] as [string, unknown[]]
      expect(sql).toContain('INSERT OR REPLACE')
      expect(params).toContain('acknowledged')
    })
  })

  describe('findAll', () => {
    it('retorna OrbitalAlert[] reconstruídos a partir das rows', async () => {
      const alert = makeAlert()
      const service = makeSqliteService([makeRow(alert)])
      const sut = new SqliteAlertHistoryRepository(service)

      const result = await sut.findAll()

      expect(result).toHaveLength(1)
      expect(result[0]!.id).toBe(alert.id)
      expect(result[0]!.status).toBe('detected')
    })

    it('retorna lista vazia quando não há rows', async () => {
      const service = makeSqliteService([])
      const sut = new SqliteAlertHistoryRepository(service)

      const result = await sut.findAll()

      expect(result).toHaveLength(0)
    })
  })

  describe('findByStatus', () => {
    it('filtra por status acknowledged', async () => {
      const detected = makeAlert(false)
      const acked = makeAlert(true)
      const service = makeSqliteService([makeRow(detected), makeRow(acked)])
      const sut = new SqliteAlertHistoryRepository(service)

      const result = await sut.findByStatus('acknowledged')

      expect(result.every((a) => a.status === 'acknowledged')).toBe(true)
    })
  })
})
