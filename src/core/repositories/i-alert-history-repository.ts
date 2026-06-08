import { OrbitalAlert, type AlertStatus } from '@/core/entities'

export interface IAlertHistoryRepository {
  save(alert: OrbitalAlert): Promise<void>
  findAll(): Promise<OrbitalAlert[]>
  findByStatus(status: AlertStatus): Promise<OrbitalAlert[]>
}
