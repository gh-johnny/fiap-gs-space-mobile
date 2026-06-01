import { create } from 'zustand'
import { ConjunctionEvent, OrbitalAlert } from '@/domain/entities'
import { IConjunctionRepository } from '@/domain/repositories/i-conjunction-repository'
import { IAlertHistoryRepository } from '@/domain/repositories/i-alert-history-repository'
import { AcknowledgeAlert } from '@/domain/usecases/acknowledge-alert'

interface AlertState {
  conjunctions: ConjunctionEvent[]
  alertHistory: OrbitalAlert[]
  activeAlert: OrbitalAlert | null
  loadConjunctions: (repo: IConjunctionRepository) => Promise<void>
  loadAlertHistory: (repo: IAlertHistoryRepository) => Promise<void>
  triggerAlert: () => void
  acknowledgeCurrentAlert: (useCase: AcknowledgeAlert) => Promise<void>
  dismissAlert: () => void
  reset: () => void
}

export const useAlertStore = create<AlertState>((set, get) => ({
  conjunctions: [],
  alertHistory: [],
  activeAlert: null,

  async loadConjunctions(repo) {
    const conjunctions = await repo.findAll()
    set({ conjunctions })
  },

  async loadAlertHistory(repo) {
    const alertHistory = await repo.findAll()
    set({ alertHistory })
  },

  triggerAlert() {
    const { conjunctions } = get()
    const critical = conjunctions.find((c) => c.severity === 'CRITICAL')
    const target = critical ?? conjunctions[0]
    if (!target) return
    set({ activeAlert: OrbitalAlert.create(target) })
  },

  async acknowledgeCurrentAlert(useCase) {
    const { activeAlert } = get()
    if (!activeAlert) return
    const acknowledged = await useCase.execute(activeAlert)
    set({ activeAlert: acknowledged })
  },

  dismissAlert() {
    set({ activeAlert: null })
  },

  reset() {
    set({ conjunctions: [], alertHistory: [], activeAlert: null })
  },
}))
