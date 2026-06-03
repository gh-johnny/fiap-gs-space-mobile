import { create } from 'zustand'
import { ConjunctionEvent, OrbitalAlert, SatelliteObject } from '@/domain/entities'
import { ProbabilityOfCollision, MissDistance, TimeToClosestApproach } from '@/domain/value-objects'
import { IConjunctionRepository } from '@/domain/repositories/i-conjunction-repository'
import { IAlertHistoryRepository } from '@/domain/repositories/i-alert-history-repository'
import { AcknowledgeAlert } from '@/domain/usecases/acknowledge-alert'

const MAX_CONJUNCTIONS = 12

interface AlertState {
  conjunctions: ConjunctionEvent[]
  alertHistory: OrbitalAlert[]
  activeAlert: OrbitalAlert | null
  correctedCount: number
  loadConjunctions: (repo: IConjunctionRepository) => Promise<void>
  loadAlertHistory: (repo: IAlertHistoryRepository) => Promise<void>
  triggerAlert: () => void
  triggerAlertFor: (event: ConjunctionEvent) => void
  acknowledgeCurrentAlert: (useCase: AcknowledgeAlert) => Promise<void>
  dismissAlert: () => void
  incrementCorrected: () => void
  removeConjunction: (noradIdA: string, noradIdB: string) => void
  spawnRandomConjunction: (satellites: SatelliteObject[]) => ConjunctionEvent | null
  reset: () => void
}

export const useAlertStore = create<AlertState>((set, get) => ({
  conjunctions: [],
  alertHistory: [],
  activeAlert: null,
  correctedCount: 0,

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

  triggerAlertFor(event) {
    set({ activeAlert: OrbitalAlert.create(event) })
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

  incrementCorrected() {
    set((s) => ({ correctedCount: s.correctedCount + 1 }))
  },

  removeConjunction(noradIdA, noradIdB) {
    set((s) => ({
      conjunctions: s.conjunctions.filter((c) => {
        const a = String(c.objectA.noradId.value)
        const b = String(c.objectB.noradId.value)
        return !((a === noradIdA && b === noradIdB) || (a === noradIdB && b === noradIdA))
      }),
    }))
  },

  spawnRandomConjunction(satellites) {
    const { conjunctions } = get()
    if (satellites.length < 2 || conjunctions.length >= MAX_CONJUNCTIONS) return null

    const idxA = Math.floor(Math.random() * satellites.length)
    let idxB = Math.floor(Math.random() * (satellites.length - 1))
    if (idxB >= idxA) idxB++

    const satA = satellites[idxA]!
    const satB = satellites[idxB]!
    const aId = satA.noradId.value
    const bId = satB.noradId.value

    const alreadyExists = conjunctions.some((c) => {
      const ids = new Set([c.objectA.noradId.value, c.objectB.noradId.value])
      return ids.has(aId) && ids.has(bId)
    })
    if (alreadyExists) return null

    const event = ConjunctionEvent.create({
      objectA: satA,
      objectB: satB,
      pc: ProbabilityOfCollision.create(5e-5),
      missDistance: MissDistance.create(2000 + Math.random() * 12000),
      tcpa: TimeToClosestApproach.create(new Date(Date.now() + (30 + Math.random() * 90) * 60_000)),
    })
    set({ conjunctions: [...conjunctions, event] })
    return event
  },

  reset() {
    set({ conjunctions: [], alertHistory: [], activeAlert: null })
  },
}))
