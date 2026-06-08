import { SatelliteJsAdapter } from '@/infrastructure/adapters/satellite-js-adapter'
import { MockTleGateway } from '@/infrastructure/gateways/mock-tle-gateway'
import { SqliteKvStorageGateway } from '@/infrastructure/gateways/sqlite-kv-storage-gateway'
import { ExpoHapticsGateway } from '@/infrastructure/gateways/expo-haptics-gateway'
import { ExpoLocationGateway } from '@/infrastructure/gateways/expo-location-gateway'
import { ExpoNotificationGateway } from '@/infrastructure/gateways/expo-notification-gateway'
import { MockSatelliteRepository } from '@/infrastructure/repositories/mock-satellite-repository'
import { MockConjunctionRepository } from '@/infrastructure/repositories/mock-conjunction-repository'
import { SqliteService } from '@/infrastructure/persistence/sqlite-service'
import { SqliteAlertHistoryRepository } from '@/infrastructure/persistence/sqlite-alert-history-repository'
import { PropagateOrbits } from '@/core/usecases/propagate-orbits'
import { DetectConjunctions } from '@/core/usecases/detect-conjunctions'
import { ClassifyRisk } from '@/core/usecases/classify-risk'
import { AcknowledgeAlert } from '@/core/usecases/acknowledge-alert'

// Adapters
const satelliteJsAdapter = new SatelliteJsAdapter()

// Services (must initialize before gateways that depend on it)
const sqliteService = new SqliteService()
sqliteService.initialize()

// Gateways
const tleGateway = new MockTleGateway()
const storageGateway = new SqliteKvStorageGateway(sqliteService)
const hapticsGateway = new ExpoHapticsGateway()
const locationGateway = new ExpoLocationGateway()
const notificationGateway = new ExpoNotificationGateway()

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
  locationGateway,
  notificationGateway,
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
