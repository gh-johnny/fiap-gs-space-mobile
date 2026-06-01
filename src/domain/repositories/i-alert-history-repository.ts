import { OrbitalAlert, type AlertStatus } from '@/domain/entities'

export interface IAlertHistoryRepository {
  save(alert: OrbitalAlert): Promise<void>
  findAll(): Promise<OrbitalAlert[]>
  findByStatus(status: AlertStatus): Promise<OrbitalAlert[]>
}
