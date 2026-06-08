import { create } from 'zustand'
import { ConjunctionEvent, OrbitalAlert, SatelliteObject } from '@/core/entities'
import { ProbabilityOfCollision, MissDistance, TimeToClosestApproach } from '@/core/value-objects'
import { IConjunctionRepository } from '@/core/repositories/i-conjunction-repository'
import { IAlertHistoryRepository } from '@/core/repositories/i-alert-history-repository'
import { AcknowledgeAlert } from '@/core/usecases/acknowledge-alert'

const MAX_CONJUNCTIONS         = 20
const MAX_CONJUNCTIONS_PER_BODY = 2

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
  seedAllConjunctions: (satellites: SatelliteObject[]) => ConjunctionEvent[]
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

    const controllable   = satellites.filter(s => s.isControllable())
    const uncontrollable = satellites.filter(s => !s.isControllable())
    if (controllable.length === 0) return null

    // Count active conjunctions per body to enforce per-body cap
    const pairCount = new Map<number, number>()
    for (const c of conjunctions) {
      const a = c.objectA.noradId.value
      const b = c.objectB.noradId.value
      pairCount.set(a, (pairCount.get(a) ?? 0) + 1)
      pairCount.set(b, (pairCount.get(b) ?? 0) + 1)
    }
    const underLimit = (id: number) => (pairCount.get(id) ?? 0) < MAX_CONJUNCTIONS_PER_BODY

    const eligibleA = controllable.filter(s => underLimit(s.noradId.value))
    if (eligibleA.length === 0) return null

    const satA = eligibleA[Math.floor(Math.random() * eligibleA.length)]!

    // 90% chance: pair with non-controllable body (asteroid/debris)
    // 10% chance: pair with another controllable satellite
    let satB: SatelliteObject | undefined
    if (uncontrollable.length > 0 && Math.random() < 0.90) {
      const eligibleU = uncontrollable.filter(s => underLimit(s.noradId.value))
      if (eligibleU.length > 0) {
        satB = eligibleU[Math.floor(Math.random() * eligibleU.length)]
      }
    }
    if (!satB) {
      const eligibleC = eligibleA.filter(s => s.noradId.value !== satA.noradId.value)
      if (eligibleC.length === 0) return null
      satB = eligibleC[Math.floor(Math.random() * eligibleC.length)]
    }
    if (!satB) return null

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

  seedAllConjunctions(satellites) {
    const { conjunctions } = get()
    const controllable   = satellites.filter(s => s.isControllable())
    const uncontrollable = satellites.filter(s => !s.isControllable())
    if (controllable.length === 0 || uncontrollable.length === 0) return []

    const pairedIds = new Set(
      conjunctions.flatMap(c => [c.objectA.noradId.value, c.objectB.noradId.value])
    )

    const unpaired = uncontrollable.filter(b => !pairedIds.has(b.noradId.value))
    const toSeed: typeof unpaired = []

    const seeded: ConjunctionEvent[] = []

    for (const body of toSeed) {
      const satA = controllable[Math.floor(Math.random() * controllable.length)]!

      // Severity distribution: 15% CRITICAL, 35% WARNING, 50% INFO
      const r = Math.random()
      const pc = r < 0.15
        ? 1e-4 + Math.random() * 4e-4
        : r < 0.50
          ? 1e-5 + Math.random() * 9e-5
          : 1e-6 + Math.random() * 9e-6

      const event = ConjunctionEvent.create({
        objectA: satA,
        objectB: body,
        pc: ProbabilityOfCollision.create(pc),
        missDistance: MissDistance.create(2000 + Math.random() * 18000),
        tcpa: TimeToClosestApproach.create(new Date(Date.now() + (20 + Math.random() * 160) * 60_000)),
      })

      seeded.push(event)
      pairedIds.add(body.noradId.value)
    }

    if (seeded.length > 0) {
      set(s => ({ conjunctions: [...s.conjunctions, ...seeded] }))
    }

    return seeded
  },

  reset() {
    set({ conjunctions: [], alertHistory: [], activeAlert: null })
  },
}))
