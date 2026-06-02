import { SatelliteJsAdapter } from '@/infrastructure/adapters/satellite-js-adapter'
import { MockTleGateway } from '@/infrastructure/gateways/mock-tle-gateway'
import { SqliteKvStorageGateway } from '@/infrastructure/gateways/sqlite-kv-storage-gateway'
import { ExpoHapticsGateway } from '@/infrastructure/gateways/expo-haptics-gateway'
import { MockSatelliteRepository } from '@/infrastructure/repositories/mock-satellite-repository'
import { MockConjunctionRepository } from '@/infrastructure/repositories/mock-conjunction-repository'
import { SqliteService } from '@/infrastructure/persistence/sqlite-service'
import { SqliteAlertHistoryRepository } from '@/infrastructure/persistence/sqlite-alert-history-repository'
import { PropagateOrbits } from '@/domain/usecases/propagate-orbits'
import { DetectConjunctions } from '@/domain/usecases/detect-conjunctions'
import { ClassifyRisk } from '@/domain/usecases/classify-risk'
import { AcknowledgeAlert } from '@/domain/usecases/acknowledge-alert'

// Adapters
const satelliteJsAdapter = new SatelliteJsAdapter()

// Services (must initialize before gateways that depend on it)
const sqliteService = new SqliteService()
sqliteService.initialize()

// Gateways
const tleGateway = new MockTleGateway()
const storageGateway = new SqliteKvStorageGateway(sqliteService)
const hapticsGateway = new ExpoHapticsGateway()

// Repositories
const satelliteRepository = new MockSatelliteRepository(tleGateway)
const conjunctionRepository = new MockConjunctionRepository()
const alertHistoryRepository = new SqliteAlertHistoryRepository(sqliteService)

// Use cases
const propagateOrbits = new PropagateOrbits(satelliteJsAdapter)
const detectConjunctions = new DetectConjunctions()
const classifyRisk = new ClassifyRisk()
const acknowledgeAlert = new AcknowledgeAlert(storageGateway, alertHistoryRepository)

export const container = {
  satelliteJsAdapter,
  tleGateway,
  storageGateway,
  hapticsGateway,
  sqliteService,
  satelliteRepository,
  conjunctionRepository,
  alertHistoryRepository,
  propagateOrbits,
  detectConjunctions,
  classifyRisk,
  acknowledgeAlert,
} as const

export type Container = typeof container
