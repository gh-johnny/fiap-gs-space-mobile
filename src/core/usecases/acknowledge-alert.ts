import { OrbitalAlert } from '@/core/entities/orbital-alert'
import { IStorageGateway } from '@/core/gateways/i-storage-gateway'
import { IAlertHistoryRepository } from '@/core/repositories/i-alert-history-repository'

export class AcknowledgeAlert {
  constructor(
    private readonly storageGateway: IStorageGateway,
    private readonly alertHistoryRepository: IAlertHistoryRepository,
  ) {}

  async execute(alert: OrbitalAlert): Promise<OrbitalAlert> {
    const acknowledged = alert.acknowledge()
    this.storageGateway.set(`alert:${alert.id}`, acknowledged)
    await this.alertHistoryRepository.save(acknowledged)
    return acknowledged
  }
}
