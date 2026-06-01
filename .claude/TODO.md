# Todo List

> Plan: Orbital Guardian Mobile — Clean Architecture, SGP4, globe.gl, SQLite, TDD ≥90%, demo-ready FIAP GS 2026
> Mode: careful
> Created: 2026-06-01

---

## Fase 0 — ✅ Setup do projeto ✅

- [x] Instalar runtime: `npx expo install expo-haptics expo-blur expo-sqlite zod react-native-mmkv zustand` — `done`
- [x] Instalar `satellite.js`: `npm install satellite.js` — `done`
- [x] Instalar devDeps: `jest-expo @testing-library/react-native @types/jest @react-native/jest-preset jest` — `done` (sem @types/satellite.js — lib tem tipos próprios)
- [x] Criar `jest.config.js` com preset `jest-expo` e configurações de cobertura — `done`
- [x] Configurar `coverageThreshold`: `lines: 90, functions: 90, branches: 90` — `done`
- [x] Configurar `coveragePathIgnorePatterns` — `done`
- [x] Adicionar scripts `"test"` e `"test:coverage"` ao `package.json` — `done`
- [x] Habilitar `strictNullChecks: true`, `noUncheckedIndexedAccess: true` no `tsconfig.json` — `done`
- [x] Criar todas as pastas: `domain/{entities,value-objects,repositories,gateways,usecases}` — `done`
- [x] Criar todas as pastas: `infrastructure/{adapters,gateways,repositories,persistence}` — `done`
- [x] Criar todas as pastas: `application/{container,config,stores}` — `done`
- [x] Criar todas as pastas: `presentation/{screens,components,hooks}` — `done`
- [x] Criar pastas: `data/`, `shared/{types,utils}` — `done`

---

## Fases 1–5 — Value Objects ✅

- [x] `norad-id.ts` + 7 testes — `done`
- [x] `tle-data.ts` + testes (create + isExpired) — `done`
- [x] `probability-of-collision.ts` + testes (create, exceedsThreshold, toSeverity, toScientificNotation) — `done`
- [x] `miss-distance.ts` + testes (create, isDangerous, isCritical, toDisplayString) — `done`
- [x] `time-to-closest-approach.ts` + testes (create, actionWindowIsOpen, toDisplayString, toUtcString) — `done`
- [x] `index.ts` — re-exporta todos os value objects — `done`
- [x] 44 testes passando — `done`

---

## Fases 6–8 — Entidades de domínio ✅

- [x] `satellite-object.ts` + 4 testes (create, nome vazio, readonly) — `done`
- [x] `conjunction-event.ts` + 4 testes (create, severity, isActive) — `done`
- [x] `orbital-alert.ts` + 7 testes (create, acknowledge imutável, dismiss imutável) — `done`
- [x] `entities/index.ts` — re-exporta entidades e tipos — `done`
- [x] 15 testes passando — `done`

---

## Fase 9 — ✅ Interfaces de domínio ✅

- [x] `i-satellite-repository.ts`, `i-conjunction-repository.ts`, `i-alert-history-repository.ts` + index — `done`
- [x] `i-tle-gateway.ts`, `i-storage-gateway.ts`, `i-haptics-gateway.ts` + index — `done`
- [x] 59 testes do domínio completo passando — `done`

---

## Fase 10 — ✅ Use Case: PropagateOrbits ✅

- [x] Criar `src/domain/usecases/propagate-orbits.test.ts` — `done`
- [x] Criar mock de `ISatelliteJsAdapter` — `done`
- [x] Teste: `execute([satellite], date)` chama adapter para cada satélite — `done`
- [x] Teste: posições `null` do adapter são filtradas — `done`
- [x] Teste: retorna `OrbitPosition[]` com `noradId`, `lat`, `lng`, `alt` válidos — `done`
- [x] Definir interface `OrbitPosition` em `src/domain/usecases/propagate-orbits.ts` — `done`
- [x] Criar `PropagateOrbits` com `ISatelliteJsAdapter` injetado — `done`
- [x] Confirmar todos os testes passam — `done` (5/5)

---

## Fase 11 — ✅ Use Case: DetectConjunctions ✅

- [x] Criar `src/domain/usecases/detect-conjunctions.test.ts` — `done`
- [x] Teste: dois objetos a `< 50km` geram um `ConjunctionEvent` — `done`
- [x] Teste: dois objetos a `> 50km` não geram evento — `done`
- [x] Teste: 3 objetos onde 2 estão próximos retorna 1 evento — `done`
- [x] Teste: eventos ordenados CRITICAL → WARNING → INFO — `done`
- [x] Criar `DetectConjunctions` com `execute(satellites, positions): ConjunctionEvent[]` — `done`
- [x] Calcular distância 3D entre todos os pares — `done`
- [x] Filtrar pares com distância `< MAX_CONJUNCTION_DISTANCE_KM (50)` — `done`
- [x] Criar `ConjunctionEvent` para cada par com Pc e MissDistance proporcionais à distância — `done`
- [x] Confirmar todos os testes passam — `done` (6/6)

---

## Fase 12 — ✅ Use Case: ClassifyRisk ✅

- [x] Criar `src/domain/usecases/classify-risk.test.ts` — `done`
- [x] Teste: `MissDistance.isCritical()` → `'CRITICAL'` independente do Pc — `done`
- [x] Teste: `Pc > 1e-4` com `MissDistance` não crítica → `'CRITICAL'` — `done`
- [x] Teste: `Pc` entre `1e-5..1e-4` → `'WARNING'` — `done`
- [x] Teste: `Pc ≤ 1e-5` → `'INFO'` — `done`
- [x] Criar `ClassifyRisk` com `execute(pc, miss): Severity` — `done`
- [x] Regra: `isCritical()` tem precedência sobre Pc — `done`
- [x] Confirmar todos os testes passam — `done` (7/7)

---

## Fase 13 — ✅ Use Case: AcknowledgeAlert ✅

- [x] Criar `src/domain/usecases/acknowledge-alert.test.ts` — `done`
- [x] Criar mock de `IStorageGateway` — `done`
- [x] Criar mock de `IAlertHistoryRepository` — `done`
- [x] Teste: `execute(alert)` retorna `OrbitalAlert` com `status: 'acknowledged'` — `done`
- [x] Teste: `execute` chama `storageGateway.set` com chave correta — `done`
- [x] Teste: `execute` chama `alertHistoryRepository.save` com o alert atualizado — `done`
- [x] Teste: retorno é nova instância (imutabilidade garantida) — `done`
- [x] Criar `AcknowledgeAlert` injetando `IStorageGateway` e `IAlertHistoryRepository` — `done`
- [x] Criar `src/domain/usecases/index.ts` — re-exporta use cases e `OrbitPosition` — `done`
- [x] Confirmar todos os testes passam — `done` (4/4)

---

## Fase 14 — ✅ Tipos Externos (Anti-Corruption Layer)

- [x] Criar `src/infrastructure/adapters/satellite-js-external-types.ts` — `SatRecExternal`, `EciVec3External`, `GeodeticVec3External` — `done`
- [x] Criar `src/infrastructure/adapters/globe-gl-external-types.ts` — `GlobePointData`, `GlobeArcData` — `done`
- [x] Criar `src/infrastructure/gateways/tle-record-external.ts` — `TleRecordExternal` espelhando formato do `tles.json` — `done`
- [x] Criar `src/infrastructure/persistence/sqlite-external-types.ts` — `SqliteResultRowExternal` com campos do schema — `done`

---

## Fase 15 — ✅ Adapter: SatelliteJsAdapter

- [x] Criar `src/infrastructure/adapters/i-satellite-js-adapter.ts` — `propagate(tle: TLEData, ts: Date): OrbitPosition | null` — `done`
- [x] Criar `src/infrastructure/adapters/satellite-js-adapter.test.ts` — `done`
- [x] Criar fixture de `TLEData` válido com dados reais de satélite — `done`
- [x] Teste: `propagate(validTle, now)` retorna `OrbitPosition` com lat/lng/alt numéricos — `done`
- [x] Teste: `lat` entre -90 e 90, `lng` entre -180 e 180 — `done`
- [x] Teste: `propagate` com TLE inválido retorna `null` sem lançar — `done`
- [x] Criar `src/infrastructure/adapters/satellite-js-adapter.ts` implementando a interface — `done`
- [x] Chamar `twoline2satrec` — tipar resultado como `SatRecExternal` — `done`
- [x] Chamar `propagate(satrec, date)` — tratar erro retornando `null` — `done`
- [x] Converter `EciVec3External` → geodésico com `eciToGeodetic()` — `done`
- [x] Converter radianos → graus para lat/lng — `done`
- [x] Criar `src/infrastructure/adapters/index.ts` — `done`
- [x] Confirmar todos os testes passam — `done`

---

## Fase 16 — ✅ Adapter: GlobeGlAdapter

- [x] Criar `src/infrastructure/adapters/i-globe-gl-adapter.ts` — interface com `updatePositions`, `highlightConjunction`, `clearHighlight`, `dimGlobe`, `undimGlobe` — `done`
- [x] Criar `src/infrastructure/adapters/globe-gl-adapter.ts` implementando a interface — `done`
- [x] Receber `RefObject<WebView>` no construtor — `done`
- [x] Implementar `updatePositions(positions)` — converter `OrbitPosition[]` → `GlobePointData[]` e enviar postMessage — `done`
- [x] Implementar `highlightConjunction(event)` — enviar noradIds e cor `#FF3B30` — `done`
- [x] Implementar `clearHighlight()` — resetar arcos — `done`
- [x] Implementar `dimGlobe(opacity)` e `undimGlobe()` — comandos de overlay — `done`
- [x] Confirmar arquivos no `index.ts` — `done`

---

## Fase 17 — ✅ Gateways de Infraestrutura

- [x] Criar `src/data/tles.json` com ~50 TLEs reais (Starlink, ISS, Hubble, Landsat-8, Sentinel-2) — `done`
- [x] Incluir 3 entradas `type: "DEBRIS"` e 1 `type: "ROCKET_BODY"` — `done`
- [x] Criar `src/infrastructure/gateways/mock-tle-gateway.test.ts` — `done`
- [x] Teste: `fetchTLEs()` retorna array não vazio — `done`
- [x] Teste: todos os `TLEData` têm `line1` e `line2` válidos — `done`
- [x] Criar `src/infrastructure/gateways/mock-tle-gateway.ts` — importa JSON, mapeia `TleRecordExternal[]` → `TLEData.create()` — `done`
- [x] Criar `src/infrastructure/gateways/mmkv-storage-gateway.ts` — `done`
- [x] Implementar `get<T>`, `set<T>`, `remove` via `MMKV` instance — `done`
- [x] Criar `src/infrastructure/gateways/expo-haptics-gateway.ts` — `done`
- [x] Implementar `warn()` e `impact()` via `expo-haptics` — `done`
- [x] Criar `src/infrastructure/gateways/index.ts` — `done`
- [x] Confirmar testes dos gateways testáveis passam — `done`

---

## Fase 18 — ✅ Repositórios Mock

- [x] Criar `src/infrastructure/repositories/mock-satellite-repository.test.ts` — `done`
- [x] Criar mock de `ITleGateway` — `done`
- [x] Teste: `findAll()` retorna array não vazio de `SatelliteObject` — `done`
- [x] Teste: cada objeto tem `noradId`, `name`, `type`, `tleData` válidos — `done`
- [x] Criar `src/infrastructure/repositories/mock-satellite-repository.ts` — injetar `ITleGateway` — `done`
- [x] Implementar `findAll()` mapeando TLEs para `SatelliteObject.create()` — `done`
- [x] Criar `src/infrastructure/repositories/mock-conjunction-repository.test.ts` — `done`
- [x] Teste: `findAll()` retorna 3 eventos (1 CRITICAL, 1 WARNING, 1 INFO) — `done`
- [x] Teste: `findBySeverity('CRITICAL')` retorna só críticos — `done`
- [x] Criar `src/infrastructure/repositories/mock-conjunction-repository.ts` — `done`
- [x] Definir 3 conjunções hardcoded com dados realistas via static factories — `done`
- [x] Criar `src/infrastructure/repositories/index.ts` — `done`
- [x] Confirmar todos os testes passam — `done`

---

## Fase 19 — ✅ SQLite: SqliteService

- [x] Criar `src/infrastructure/persistence/sqlite-service.test.ts` — `done`
- [x] Teste: `initialize()` cria a tabela `orbital_alerts` se não existir — `done`
- [x] Teste: `initialize()` é idempotente (executar duas vezes não quebra) — `done`
- [x] Teste: versão de migration é registrada corretamente — `done`
- [x] Criar `src/infrastructure/persistence/sqlite-service.ts` — `done`
- [x] Abrir DB via `SQLite.openDatabaseSync('orbital-guardian.db')` — `done`
- [x] Definir array `MIGRATIONS: Migration[]` com v1: `CREATE TABLE IF NOT EXISTS orbital_alerts (...)` — `done`
- [x] Implementar `initialize()` executando migrations pendentes — `done`
- [x] Implementar `getDb()` retornando a conexão após inicialização — `done`
- [x] Confirmar todos os testes passam — `done`

---

## Fase 20 — ✅ SQLite: SqliteAlertHistoryRepository

- [x] Criar `src/infrastructure/persistence/sqlite-alert-history-repository.test.ts` — `done`
- [x] Criar mock de `SqliteService` para os testes — `done`
- [x] Teste: `save(detectedAlert)` persiste registro no banco — `done`
- [x] Teste: `save(acknowledgedAlert)` persiste com `status: 'acknowledged'` — `done`
- [x] Teste: `findAll()` retorna `OrbitalAlert[]` reconstruídos com static factories — `done`
- [x] Teste: `findByStatus('acknowledged')` retorna só alertas com esse status — `done`
- [x] Teste: `findAll()` retorna lista ordenada por `detected_at DESC` — `done`
- [x] Criar `src/infrastructure/persistence/sqlite-alert-history-repository.ts` implementando `IAlertHistoryRepository` — `done`
- [x] Injetar `SqliteService` no construtor — `done`
- [x] Implementar `save(alert)` — serializar `OrbitalAlert` para row usando `SqliteResultRowExternal` — `done`
- [x] Implementar `findAll()` — buscar rows, reconstruir `OrbitalAlert` via static factories — `done`
- [x] Implementar `findByStatus(status)` — query com `WHERE status = ?` — `done`
- [x] Confirmar todos os testes passam — `done`

---

## Fase 21 — ✅ Application: Config e DI Container

- [x] Criar `src/application/config/env.ts` — schema Zod: `APP_ENV`, `GLOBE_UPDATE_INTERVAL_MS`, `HIDDEN_TRIGGER_TAPS` — `done`
- [x] Chamar `schema.parse(process.env)` e exportar `env` tipado — `done`
- [x] Criar `.env` com valores de desenvolvimento — `done`
- [x] Criar `src/application/container/container.ts` — instanciar na ordem correta (adapters → gateways → services → repositories → usecases) — `done`
- [x] Instanciar `SqliteService` e chamar `initialize()` no startup — `done`
- [x] Instanciar `SqliteAlertHistoryRepository(sqliteService)` — `done`
- [x] Instanciar `AcknowledgeAlert(storageGateway, alertHistoryRepository)` — `done`
- [x] Exportar `container as const` e tipo `Container` — `done`
- [x] Criar `src/application/container/container-context.tsx` com `ContainerProvider` — `done`
- [x] Criar `src/presentation/hooks/use-di.ts`: `useDI<K extends keyof Container>(key: K)` — `done`
- [x] Adicionar `ContainerProvider` no `src/app/_layout.tsx` — `done`

---

## Fase 22 — ✅ Application: Zustand Stores

- [x] Criar `src/application/stores/use-orbital-store.test.ts` — `done`
- [x] Criar mocks de `ISatelliteRepository` e `PropagateOrbits` — `done`
- [x] Teste: `loadSatellites()` popula `satellites` — `done`
- [x] Teste: `propagatePositions(now)` popula `positions` — `done`
- [x] Teste: `isLoading` é `true` durante e `false` após carregamento — `done`
- [x] Criar `src/application/stores/use-orbital-store.ts` — `done`
- [x] Criar `src/application/stores/use-alert-store.test.ts` — `done`
- [x] Criar mocks de `IConjunctionRepository` e `IAlertHistoryRepository` — `done`
- [x] Teste: `loadConjunctions()` popula `conjunctions` — `done`
- [x] Teste: `loadAlertHistory()` popula `alertHistory` via `IAlertHistoryRepository.findAll()` — `done`
- [x] Teste: `triggerAlert()` seta `activeAlert` com primeira conjunção CRITICAL — `done`
- [x] Teste: `acknowledgeCurrentAlert()` → chama use case → persiste no SQLite (via mock) — `done`
- [x] Teste: `dismissAlert()` seta `activeAlert` para `null` — `done`
- [x] Criar `src/application/stores/use-alert-store.ts` com todas as actions — `done`
- [x] Criar `src/application/stores/index.ts` — `done`
- [x] Confirmar todos os testes passam — `done`

---

## Fase 23 — ✅ Globe: HTML e globe.gl

- [x] Criar `src/presentation/components/globe-view/globe.html` — `done`
- [x] Carregar globe.gl via CDN (unpkg.com) no `<script>` — `done`
- [x] Inicializar `Globe()` no `<div id="globe">` após DOM ready — `done`
- [x] Configurar globo: `globeImageUrl`, `backgroundColor('rgba(0,0,0,0)')`, `atmosphereColor` — `done`
- [x] Adicionar layer de pontos com `pointColor` diferenciado por tipo — `done`
- [x] Adicionar layer de arcos para `ConjunctionLine` com animação pulse — `done`
- [x] Implementar `window.addEventListener('message')` com handlers para cada comando — `done`
- [x] Handler `UPDATE_POSITIONS` — `done`
- [x] Handler `HIGHLIGHT_CONJUNCTION` — `done`
- [x] Handler `CLEAR_HIGHLIGHT` — `done`
- [x] Handler `DIM_GLOBE` e `UNDIM_GLOBE` — `done`
- [x] Configurar auto-rotação suave (`autoRotate: true`, `autoRotateSpeed: 0.5`) — `done`

---

## Fase 24 — ✅ Presentation: Hooks

- [x] Criar `src/presentation/hooks/use-orbital-loop.test.ts` — `done`
- [x] Teste: loop chama `propagatePositions` a cada intervalo — `done`
- [x] Teste: cleanup cancela o interval — `done`
- [x] Criar `src/presentation/hooks/use-orbital-loop.ts` — `done`
- [x] Criar `src/presentation/hooks/use-hidden-trigger.test.ts` — `done`
- [x] Teste: 5 taps no canto superior direito dentro de 1.5s dispara `onTrigger` — `done`
- [x] Teste: 5 taps fora do canto não dispara — `done`
- [x] Teste: intervalo > 1.5s entre taps reseta contador — `done`
- [x] Teste: 4 taps não dispara — `done`
- [x] Criar `src/presentation/hooks/use-hidden-trigger.ts` — `done`
- [x] Criar `src/presentation/hooks/use-presentation-mode.test.ts` — `done`
- [x] Teste: `toggle()` alterna `isPresentationMode` — `done`
- [x] Teste: estado persiste via `IStorageGateway` mockado — `done`
- [x] Criar `src/presentation/hooks/use-presentation-mode.ts` — `done`
- [x] Confirmar todos os testes de hooks passam — `done`

---

## Fase 25 — ✅ Presentation: Componentes e Telas

- [x] Criar `src/presentation/components/globe-view/globe-view.tsx` — WebView com ref, `IGlobeGlAdapter` via `useImperativeHandle` — `done`
- [x] Criar `src/presentation/components/alert-card/alert-card.tsx` — glassmorphism com `expo-blur` — `done`
- [x] Exibir severity badge, nomes, Pc, MissDistance, TCPA, recomendação, janela de ação — `done`
- [x] Animar entrada com `useAnimatedStyle` + `withSpring` (Reanimated 4 worklet) — `done`
- [x] Criar `src/presentation/components/conjunction-item/conjunction-item.tsx` — severity bar + dados — `done`
- [x] Criar `src/presentation/screens/globe-screen.tsx` — GlobeView em `absoluteFill` — `done`
- [x] Integrar `useHiddenTrigger` → `triggerAlert()` — `done`
- [x] Criar shared value `globeDimOpacity`, sincronizar dim + AlertCard surgimento — `done`
- [x] Disparar `ExpoHapticsGateway.warn()` no trigger — `done`
- [x] Criar `src/presentation/screens/alert-detail-screen.tsx` — modal com `expo-blur` — `done`
- [x] Chamar `acknowledgeCurrentAlert()` ao montar — persiste no SQLite — `done`
- [x] Criar `src/presentation/screens/conjunction-list-sheet.tsx` — bottom sheet manual com Reanimated — `done`
- [x] Seção "Ativas" — conjunções mockadas; seção "Histórico" — alertas do SQLite — `done`
- [x] Implementar swipe-down para fechar com gesture handler — `done`
- [x] Criar `src/presentation/screens/onboarding-screen.tsx` — verificar flag + salvar ao confirmar — `done`

---

## Fase 26 — ✅ Navegação e Tema

- [x] Atualizar `src/app/_layout.tsx` — Stack puro, `ContainerProvider` como wrapper raiz — `done`
- [x] Criar `src/app/alert-detail.tsx` — rota com `presentation: 'modal'` — `done`
- [x] Remover `src/app/explore.tsx` e `src/components/app-tabs.tsx` — `done`
- [x] Atualizar `src/constants/theme.ts` com paleta glassmorphism dark completa — `done`
- [x] Adicionar cores: `alert.critical`, `alert.warning`, `alert.info` — `done`
- [x] Adicionar cores: `satellite`, `debris`, `conjunctionLine` — `done`
- [x] Adicionar tokens: `glass.background`, `glass.border` — `done`
- [x] Criar `src/shared/utils/formatters.ts` com `formatPc`, `formatDistance`, `formatTcpa` — `done`
- [x] Criar `src/shared/utils/formatters.test.ts` e testar cada formatter — `done`

---

## Fase 27 — ✅ Polish, Cobertura e Demo

- [x] Rodar `npm run test:coverage` — garantir ≥ 90% em todas as camadas — `done`
- [x] Corrigir quaisquer gaps de cobertura identificados — `done`
- [x] Verificar auto-rotação suave do globo — `done`
- [x] Verificar spring animation do AlertCard sem jank (worklet na UI thread) — `done`
- [x] Verificar sincronização: globo dim + AlertCard + haptics no mesmo frame — `done`
- [x] Testar fluxo completo: abertura → globo → 5 taps → alerta → detail → SQLite persiste → lista com histórico — `done`
- [x] Verificar seção "Histórico" na ConjunctionListSheet exibe alertas do SQLite — `done`
- [x] Testar primeiro acesso: apagar flag MMKV e verificar onboarding — `done`
- [x] Verificar PresentationMode oculta elementos corretos — `done`
- [x] Testar em iOS e Android — `done`
- [x] Gravar vídeo de backup da demo completa — `done`
