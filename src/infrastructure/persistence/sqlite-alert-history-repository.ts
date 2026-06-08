import { IAlertHistoryRepository } from '@/core/repositories/i-alert-history-repository'
import { OrbitalAlert, ConjunctionEvent, SatelliteObject, SatelliteObjectType } from '@/core/entities'
import {
  NoradId,
  TLEData,
  ProbabilityOfCollision,
  MissDistance,
  TimeToClosestApproach,
  type AlertStatus,
} from '@/core/value-objects'
import { SqliteService } from './sqlite-service'
import type { SqliteAlertRowExternal } from './sqlite-external-types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToAlert(row: SqliteAlertRowExternal): OrbitalAlert | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = JSON.parse(row.conjunction_event_json) as any

    const makeSat = (s: any): SatelliteObject =>
      SatelliteObject.create({
        noradId: NoradId.create(s.noradId.value),
        name: s.name,
        type: s.type as SatelliteObjectType,
        tleData: TLEData.create(s.tleData.line1, s.tleData.line2),
      })

    const event = ConjunctionEvent.create({
      objectA: makeSat(data.objectA),
      objectB: makeSat(data.objectB),
      pc: ProbabilityOfCollision.create(data.pc.value),
      missDistance: MissDistance.create(data.missDistance.meters),
      tcpa: TimeToClosestApproach.create(new Date(data.tcpa.date)),
    })

    return OrbitalAlert.reconstruct({
      id: row.id,
      conjunctionEvent: event,
      status: row.status as AlertStatus,
      detectedAt: new Date(row.detected_at),
    })
  } catch {
    return null
  }
}

export class SqliteAlertHistoryRepository implements IAlertHistoryRepository {
  constructor(private readonly sqliteService: SqliteService) {}

  async save(alert: OrbitalAlert): Promise<void> {
    const db = this.sqliteService.getDb()
    db.runSync(
      'INSERT OR REPLACE INTO orbital_alerts (id, conjunction_event_json, status, detected_at) VALUES (?, ?, ?, ?)',
      [
        alert.id,
        JSON.stringify(alert.conjunctionEvent),
        alert.status,
        alert.detectedAt.toISOString(),
      ],
    )
  }

  async findAll(): Promise<OrbitalAlert[]> {
    const db = this.sqliteService.getDb()
    const rows = db.getAllSync<SqliteAlertRowExternal>(
      'SELECT * FROM orbital_alerts ORDER BY detected_at DESC',
    )
    return rows.flatMap((row) => {
      const alert = rowToAlert(row)
      return alert ? [alert] : []
    })
  }

  async findByStatus(status: AlertStatus): Promise<OrbitalAlert[]> {
    const all = await this.findAll()
    return all.filter((a) => a.status === status)
  }
}
