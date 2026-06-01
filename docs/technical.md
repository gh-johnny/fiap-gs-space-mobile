# Arquitetura Técnica — Orbital Guardian Mobile

---

## Stack

| Camada | Tecnologia |
|---|---|
| Plataforma | Expo SDK 56, React Native 0.85, React 19 |
| Linguagem | TypeScript (strict, strictNullChecks, noUncheckedIndexedAccess) |
| Navegação | Expo Router — Stack puro, globo permanente + bottom sheet + modal |
| Globo 3D | WebView + globe.gl (CDN) via postMessage bridge |
| Orbital math | satellite.js (SGP4) — encapsulado em `SatelliteJsAdapter` |
| Estado global | Zustand — stores consomem use cases via DI |
| Animações | Reanimated 4 worklets + shared values |
| Styling | StyleSheet + expo-glass-effect + expo-blur |
| Haptics | expo-haptics — wrappado em `ExpoHapticsGateway` |
| Storage local (KV) | react-native-mmkv — wrappado em `MmkvStorageGateway` |
| Storage local (SQL) | expo-sqlite — wrappado em `SqliteAlertHistoryRepository` |
| Validação | zod — env vars + schemas externos na infra |
| DI Container | Manual `container.ts` + React Context |
| Testes | jest-expo + @testing-library/react-native — cobertura ≥ 90% |

---

## Convenção de nomenclatura de arquivos

**Todos os arquivos usam `kebab-case`.** Sem exceção.

```
satellite-object.ts          ✅
SatelliteObject.ts           ❌
use-orbital-store.ts         ✅
useOrbitalStore.ts           ❌
globe-view.tsx               ✅
GlobeView.tsx                ❌
```

Símbolos dentro dos arquivos seguem TypeScript padrão: PascalCase para classes/interfaces/tipos, camelCase para funções/variáveis.

---

## Arquitetura em camadas

```
src/
├── domain/
│   ├── entities/
│   │   ├── satellite-object.ts         # private constructor + static create()
│   │   ├── satellite-object.test.ts
│   │   ├── conjunction-event.ts
│   │   ├── conjunction-event.test.ts
│   │   ├── orbital-alert.ts
│   │   ├── orbital-alert.test.ts
│   │   └── index.ts
│   │
│   ├── value-objects/
│   │   ├── norad-id.ts
│   │   ├── norad-id.test.ts
│   │   ├── tle-data.ts
│   │   ├── tle-data.test.ts
│   │   ├── probability-of-collision.ts
│   │   ├── probability-of-collision.test.ts
│   │   ├── miss-distance.ts
│   │   ├── miss-distance.test.ts
│   │   ├── time-to-closest-approach.ts
│   │   ├── time-to-closest-approach.test.ts
│   │   └── index.ts
│   │
│   ├── repositories/
│   │   ├── i-satellite-repository.ts       # findAll(): Promise<SatelliteObject[]>
│   │   ├── i-conjunction-repository.ts     # findAll(), findBySeverity()
│   │   ├── i-alert-history-repository.ts   # save(), findAll(), findByStatus()
│   │   └── index.ts
│   │
│   ├── gateways/
│   │   ├── i-tle-gateway.ts
│   │   ├── i-storage-gateway.ts
│   │   ├── i-haptics-gateway.ts
│   │   └── index.ts
│   │
│   └── usecases/
│       ├── propagate-orbits.ts
│       ├── propagate-orbits.test.ts
│       ├── detect-conjunctions.ts
│       ├── detect-conjunctions.test.ts
│       ├── classify-risk.ts
│       ├── classify-risk.test.ts
│       ├── acknowledge-alert.ts
│       ├── acknowledge-alert.test.ts
│       └── index.ts
│
├── infrastructure/
│   ├── adapters/
│   │   ├── i-satellite-js-adapter.ts
│   │   ├── satellite-js-adapter.ts         # Anti-corruption: TLEData → OrbitPosition
│   │   ├── satellite-js-adapter.test.ts
│   │   ├── satellite-js-external-types.ts  # SatRec, EciVec3, GeodeticVec3
│   │   ├── i-globe-gl-adapter.ts
│   │   ├── globe-gl-adapter.ts             # Anti-corruption: OrbitPosition → GlobePointData
│   │   └── globe-gl-external-types.ts      # GlobePointData, GlobeArcData
│   │
│   ├── gateways/
│   │   ├── mock-tle-gateway.ts
│   │   ├── mock-tle-gateway.test.ts
│   │   ├── tle-record-external.ts          # Formato do tles.json
│   │   ├── mmkv-storage-gateway.ts
│   │   └── expo-haptics-gateway.ts
│   │
│   ├── repositories/
│   │   ├── mock-satellite-repository.ts
│   │   ├── mock-satellite-repository.test.ts
│   │   ├── mock-conjunction-repository.ts
│   │   └── mock-conjunction-repository.test.ts
│   │
│   └── persistence/
│       ├── sqlite-service.ts               # Conexão + migrations expo-sqlite
│       ├── sqlite-service.test.ts
│       ├── sqlite-alert-history-repository.ts  # IAlertHistoryRepository via SQLite
│       ├── sqlite-alert-history-repository.test.ts
│       └── sqlite-external-types.ts        # Tipos do expo-sqlite (ResultSet, etc.)
│
├── application/
│   ├── container/
│   │   ├── container.ts                    # Isento de teste (wiring puro)
│   │   └── container-context.tsx
│   │
│   ├── config/
│   │   └── env.ts                          # Isento de teste (config pura)
│   │
│   └── stores/
│       ├── use-orbital-store.ts
│       ├── use-orbital-store.test.ts
│       ├── use-alert-store.ts
│       ├── use-alert-store.test.ts
│       └── index.ts
│
├── presentation/
│   ├── screens/
│   │   ├── globe-screen.tsx
│   │   ├── alert-detail-screen.tsx
│   │   ├── conjunction-list-sheet.tsx      # Mostra histórico SQLite + conjunções ativas
│   │   └── onboarding-screen.tsx
│   │
│   ├── components/
│   │   ├── globe-view/
│   │   │   ├── globe-view.tsx
│   │   │   ├── globe.html
│   │   │   └── index.ts
│   │   ├── alert-card/
│   │   │   ├── alert-card.tsx
│   │   │   └── index.ts
│   │   ├── conjunction-item/
│   │   │   ├── conjunction-item.tsx
│   │   │   └── index.ts
│   │   └── onboarding-slide/
│   │       ├── onboarding-slide.tsx
│   │       └── index.ts
│   │
│   └── hooks/
│       ├── use-di.ts
│       ├── use-orbital-loop.ts
│       ├── use-orbital-loop.test.ts
│       ├── use-hidden-trigger.ts
│       ├── use-hidden-trigger.test.ts
│       ├── use-presentation-mode.ts
│       └── use-presentation-mode.test.ts
│
├── data/
│   └── tles.json
│
└── shared/
    ├── types/
    │   └── index.ts
    └── utils/
        ├── formatters.ts
        └── formatters.test.ts
```

---

## Feature: Alert History (SQLite)

A única feature com persistência real. Demonstra DI na prática: a interface `IAlertHistoryRepository` tem implementação SQLite que pode substituir qualquer mock sem alterar use cases.

### O que persiste
Quando um `OrbitalAlert` muda de `detected` → `acknowledged` ou `dismissed`, é gravado no SQLite. O `ConjunctionListSheet` mostra tanto as conjunções ativas (mockadas) quanto o histórico real de alertas do SQLite.

### Schema SQLite

```sql
CREATE TABLE IF NOT EXISTS orbital_alerts (
  id TEXT PRIMARY KEY,
  conjunction_object_a TEXT NOT NULL,
  conjunction_object_b TEXT NOT NULL,
  probability_of_collision REAL NOT NULL,
  miss_distance_meters REAL NOT NULL,
  time_to_closest_approach TEXT NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('CRITICAL','WARNING','INFO')),
  status TEXT NOT NULL CHECK(status IN ('detected','acknowledged','dismissed')),
  detected_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### Migrations

`SqliteService` executa migrations na inicialização:

```typescript
// sqlite-service.ts
const MIGRATIONS: Migration[] = [
  { version: 1, sql: CREATE_ORBITAL_ALERTS_TABLE },
]
```

### Fluxo de dados

```
OrbitalAlert criado (status: 'detected')
  → useAlertStore.acknowledgeCurrentAlert()
  → AcknowledgeAlert use case
  → IAlertHistoryRepository.save(alert)          ← interface
  → SqliteAlertHistoryRepository.save(alert)     ← implementação real
  → expo-sqlite persiste no device

ConjunctionListSheet abre
  → useAlertStore.loadAlertHistory()
  → IAlertHistoryRepository.findAll()
  → SqliteAlertHistoryRepository.findAll()
  → rows → OrbitalAlert[] (via reconstrução com static factories)
  → Exibe histórico + conjunções ativas mockadas
```

---

## Padrão: Static Factory

```typescript
// satellite-object.ts
export class SatelliteObject {
  private constructor(
    readonly noradId: NoradId,
    readonly name: string,
    readonly type: SatelliteObjectType,
    readonly tleData: TLEData,
  ) {}

  static create(params: {
    noradId: NoradId
    name: string
    type: SatelliteObjectType
    tleData: TLEData
  }): SatelliteObject {
    if (!params.name.trim()) throw new Error('SatelliteObject requires a name')
    return new SatelliteObject(params.noradId, params.name, params.type, params.tleData)
  }
}

// uso correto
const sat = SatelliteObject.create({ noradId, name, type, tleData })  // ✅
const sat = new SatelliteObject(...)  // ❌ — constructor privado
```

---

## Padrão: Anti-Corruption Layer

```
satellite.js                     SatelliteJsAdapter
SatRecExternal ────────────────► OrbitPosition (interno)
EciVec3External                  { noradId, lat, lng, alt }

TleRecordExternal (JSON)         MockTleGateway
{ line1, line2, name, type } ──► TLEData.create(line1, line2)

OrbitPosition (interno)          GlobeGlAdapter
{ noradId, lat, lng, alt } ────► GlobePointData (externo → globe.gl)

expo-sqlite ResultSet            SqliteAlertHistoryRepository
Row { id, severity, ... } ─────► OrbitalAlert.create(...) (interno)
```

Tipos externos (`*-external-types.ts`) vivem **apenas em `infrastructure/`**.
O domínio nunca importa de um arquivo `*-external-types.ts`.

---

## Princípios arquiteturais

### SOLID

| Princípio | Aplicação |
|---|---|
| **SRP** | Cada use case faz uma coisa; cada adapter traduz um tipo externo |
| **OCP** | `SpaceTrackGateway` substitui `MockTleGateway` sem alterar use cases |
| **LSP** | `SqliteAlertHistoryRepository` substituível por `MockAlertHistoryRepository` em testes |
| **ISP** | `IStorageGateway` expõe só get/set/remove — não vaza MMKV |
| **DIP** | Presentation e domain dependem de interfaces, nunca de implementações |

### Object Calisthenics

- Sem primitivos soltos — `Pc`, `MissDistance`, `TCPA`, `NoradId` são value objects
- Value objects expõem comportamento: `isDangerous()`, `exceedsThreshold()`, `actionWindowIsOpen()`
- Métodos com uma responsabilidade, sem `else` aninhado

### Dependency Injection

```typescript
// container.ts — trocar Mock → Real = mudar 1 linha
export const container = {
  tleGateway: new MockTleGateway(),
  storageGateway: new MmkvStorageGateway(),
  hapticsGateway: new ExpoHapticsGateway(),
  sqliteService: new SqliteService(),                                         // novo
  satelliteJsAdapter: new SatelliteJsAdapter(),
  satelliteRepository: new MockSatelliteRepository(new MockTleGateway()),
  conjunctionRepository: new MockConjunctionRepository(),
  alertHistoryRepository: new SqliteAlertHistoryRepository(sqliteService),    // novo — SQLite real
  propagateOrbits: new PropagateOrbits(satelliteJsAdapter),
  detectConjunctions: new DetectConjunctions(),
  classifyRisk: new ClassifyRisk(),
  acknowledgeAlert: new AcknowledgeAlert(storageGateway, alertHistoryRepository),
} as const
```

---

## Cobertura de testes

| Camada | Meta |
|---|---|
| `domain/value-objects` | 100% |
| `domain/entities` | 100% |
| `domain/usecases` | 100% |
| `infrastructure/adapters` | ≥ 90% |
| `infrastructure/repositories` | ≥ 90% |
| `infrastructure/persistence` | ≥ 90% |
| `application/stores` | ≥ 90% |
| `presentation/hooks` | ≥ 90% |
| `shared/utils` | 100% |
| `application/config` | isento |
| `application/container` | isento |
| interfaces puras | isento |
| componentes visuais sem lógica | isento |

---

## Libs a instalar

```bash
npx expo install expo-haptics expo-blur expo-sqlite zod react-native-mmkv zustand
npm install satellite.js
npm install --save-dev @types/satellite.js jest-expo @testing-library/react-native
```

Globe.gl carregado via CDN no HTML inline da WebView — sem npm install.
