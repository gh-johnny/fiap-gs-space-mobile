# Todo List

> Plan: Orbital Guardian Mobile — Clean Architecture, SGP4, globe.gl, SQLite, TDD ≥90%, demo-ready FIAP GS 2026
> Mode: careful
> Created: 2026-06-01

---

## Fase 0 — Setup do projeto ✅

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

## Fase 9 — Interfaces de domínio ✅

- [x] `i-satellite-repository.ts`, `i-conjunction-repository.ts`, `i-alert-history-repository.ts` + index — `done`
- [x] `i-tle-gateway.ts`, `i-storage-gateway.ts`, `i-haptics-gateway.ts` + index — `done`
- [x] 59 testes do domínio completo passando — `done`

---

## Fase 10 — Use Case: PropagateOrbits ✅

- [x] Criar `src/domain/usecases/propagate-orbits.test.ts` — `done`
- [x] Criar mock de `ISatelliteJsAdapter` — `done`
- [x] Teste: `execute([satellite], date)` chama adapter para cada satélite — `done`
- [x] Teste: posições `null` do adapter são filtradas — `done`
- [x] Teste: retorna `OrbitPosition[]` com `noradId`, `lat`, `lng`, `alt` válidos — `done`
- [x] Definir interface `OrbitPosition` em `src/domain/usecases/propagate-orbits.ts` — `done`
- [x] Criar `PropagateOrbits` com `ISatelliteJsAdapter` injetado — `done`
- [x] Confirmar todos os testes passam — `done` (5/5)

---

## Fase 11 — Use Case: DetectConjunctions ✅

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

## Fase 12 — Use Case: ClassifyRisk ✅

- [x] Criar `src/domain/usecases/classify-risk.test.ts` — `done`
- [x] Teste: `MissDistance.isCritical()` → `'CRITICAL'` independente do Pc — `done`
- [x] Teste: `Pc > 1e-4` com `MissDistance` não crítica → `'CRITICAL'` — `done`
- [x] Teste: `Pc` entre `1e-5..1e-4` → `'WARNING'` — `done`
- [x] Teste: `Pc ≤ 1e-5` → `'INFO'` — `done`
- [x] Criar `ClassifyRisk` com `execute(pc, miss): Severity` — `done`
- [x] Regra: `isCritical()` tem precedência sobre Pc — `done`
- [x] Confirmar todos os testes passam — `done` (7/7)

---

## Fase 13 — Use Case: AcknowledgeAlert ✅

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

## Fase 14 — Tipos Externos (Anti-Corruption Layer)

- [ ] Criar `src/infrastructure/adapters/satellite-js-external-types.ts` — `SatRecExternal`, `EciVec3External`, `GeodeticVec3External` — `pending`
- [ ] Criar `src/infrastructure/adapters/globe-gl-external-types.ts` — `GlobePointData`, `GlobeArcData` — `pending`
- [ ] Criar `src/infrastructure/gateways/tle-record-external.ts` — `TleRecordExternal` espelhando formato do `tles.json` — `pending`
- [ ] Criar `src/infrastructure/persistence/sqlite-external-types.ts` — `SqliteResultRowExternal` com campos do schema — `pending`

---

## Fase 15 — Adapter: SatelliteJsAdapter

- [ ] Criar `src/infrastructure/adapters/i-satellite-js-adapter.ts` — `propagate(tle: TLEData, ts: Date): OrbitPosition | null` — `pending`
- [ ] Criar `src/infrastructure/adapters/satellite-js-adapter.test.ts` — `pending`
- [ ] Criar fixture de `TLEData` válido com dados reais de satélite — `pending`
- [ ] Teste: `propagate(validTle, now)` retorna `OrbitPosition` com lat/lng/alt numéricos — `pending`
- [ ] Teste: `lat` entre -90 e 90, `lng` entre -180 e 180 — `pending`
- [ ] Teste: `propagate` com TLE inválido retorna `null` sem lançar — `pending`
- [ ] Criar `src/infrastructure/adapters/satellite-js-adapter.ts` implementando a interface — `pending`
- [ ] Chamar `twoline2satrec` — tipar resultado como `SatRecExternal` — `pending`
- [ ] Chamar `propagate(satrec, date)` — tratar erro retornando `null` — `pending`
- [ ] Converter `EciVec3External` → geodésico com `eciToGeodetic()` — `pending`
- [ ] Converter radianos → graus para lat/lng — `pending`
- [ ] Criar `src/infrastructure/adapters/index.ts` — `pending`
- [ ] Confirmar todos os testes passam — `pending`

---

## Fase 16 — Adapter: GlobeGlAdapter

- [ ] Criar `src/infrastructure/adapters/i-globe-gl-adapter.ts` — interface com `updatePositions`, `highlightConjunction`, `clearHighlight`, `dimGlobe`, `undimGlobe` — `pending`
- [ ] Criar `src/infrastructure/adapters/globe-gl-adapter.ts` implementando a interface — `pending`
- [ ] Receber `RefObject<WebView>` no construtor — `pending`
- [ ] Implementar `updatePositions(positions)` — converter `OrbitPosition[]` → `GlobePointData[]` e enviar postMessage — `pending`
- [ ] Implementar `highlightConjunction(event)` — enviar noradIds e cor `#FF3B30` — `pending`
- [ ] Implementar `clearHighlight()` — resetar arcos — `pending`
- [ ] Implementar `dimGlobe(opacity)` e `undimGlobe()` — comandos de overlay — `pending`
- [ ] Confirmar arquivos no `index.ts` — `pending`

---

## Fase 17 — Gateways de Infraestrutura

- [ ] Criar `src/data/tles.json` com ~50 TLEs reais (Starlink, ISS, Hubble, Landsat-8, Sentinel-2) — `pending`
- [ ] Incluir 3 entradas `type: "DEBRIS"` e 1 `type: "ROCKET_BODY"` — `pending`
- [ ] Criar `src/infrastructure/gateways/mock-tle-gateway.test.ts` — `pending`
- [ ] Teste: `fetchTLEs()` retorna array não vazio — `pending`
- [ ] Teste: todos os `TLEData` têm `line1` e `line2` válidos — `pending`
- [ ] Criar `src/infrastructure/gateways/mock-tle-gateway.ts` — importa JSON, mapeia `TleRecordExternal[]` → `TLEData.create()` — `pending`
- [ ] Criar `src/infrastructure/gateways/mmkv-storage-gateway.ts` — `pending`
- [ ] Implementar `get<T>`, `set<T>`, `remove` via `MMKV` instance — `pending`
- [ ] Criar `src/infrastructure/gateways/expo-haptics-gateway.ts` — `pending`
- [ ] Implementar `warn()` e `impact()` via `expo-haptics` — `pending`
- [ ] Criar `src/infrastructure/gateways/index.ts` — `pending`
- [ ] Confirmar testes dos gateways testáveis passam — `pending`

---

## Fase 18 — Repositórios Mock

- [ ] Criar `src/infrastructure/repositories/mock-satellite-repository.test.ts` — `pending`
- [ ] Criar mock de `ITleGateway` — `pending`
- [ ] Teste: `findAll()` retorna array não vazio de `SatelliteObject` — `pending`
- [ ] Teste: cada objeto tem `noradId`, `name`, `type`, `tleData` válidos — `pending`
- [ ] Criar `src/infrastructure/repositories/mock-satellite-repository.ts` — injetar `ITleGateway` — `pending`
- [ ] Implementar `findAll()` mapeando TLEs para `SatelliteObject.create()` — `pending`
- [ ] Criar `src/infrastructure/repositories/mock-conjunction-repository.test.ts` — `pending`
- [ ] Teste: `findAll()` retorna 3 eventos (1 CRITICAL, 1 WARNING, 1 INFO) — `pending`
- [ ] Teste: `findBySeverity('CRITICAL')` retorna só críticos — `pending`
- [ ] Criar `src/infrastructure/repositories/mock-conjunction-repository.ts` — `pending`
- [ ] Definir 3 conjunções hardcoded com dados realistas via static factories — `pending`
- [ ] Criar `src/infrastructure/repositories/index.ts` — `pending`
- [ ] Confirmar todos os testes passam — `pending`

---

## Fase 19 — SQLite: SqliteService

- [ ] Criar `src/infrastructure/persistence/sqlite-service.test.ts` — `pending`
- [ ] Teste: `initialize()` cria a tabela `orbital_alerts` se não existir — `pending`
- [ ] Teste: `initialize()` é idempotente (executar duas vezes não quebra) — `pending`
- [ ] Teste: versão de migration é registrada corretamente — `pending`
- [ ] Criar `src/infrastructure/persistence/sqlite-service.ts` — `pending`
- [ ] Abrir DB via `SQLite.openDatabaseSync('orbital-guardian.db')` — `pending`
- [ ] Definir array `MIGRATIONS: Migration[]` com v1: `CREATE TABLE IF NOT EXISTS orbital_alerts (...)` — `pending`
- [ ] Implementar `initialize()` executando migrations pendentes — `pending`
- [ ] Implementar `getDb()` retornando a conexão após inicialização — `pending`
- [ ] Confirmar todos os testes passam — `pending`

---

## Fase 20 — SQLite: SqliteAlertHistoryRepository

- [ ] Criar `src/infrastructure/persistence/sqlite-alert-history-repository.test.ts` — `pending`
- [ ] Criar mock de `SqliteService` para os testes — `pending`
- [ ] Teste: `save(detectedAlert)` persiste registro no banco — `pending`
- [ ] Teste: `save(acknowledgedAlert)` persiste com `status: 'acknowledged'` — `pending`
- [ ] Teste: `findAll()` retorna `OrbitalAlert[]` reconstruídos com static factories — `pending`
- [ ] Teste: `findByStatus('acknowledged')` retorna só alertas com esse status — `pending`
- [ ] Teste: `findAll()` retorna lista ordenada por `detected_at DESC` — `pending`
- [ ] Criar `src/infrastructure/persistence/sqlite-alert-history-repository.ts` implementando `IAlertHistoryRepository` — `pending`
- [ ] Injetar `SqliteService` no construtor — `pending`
- [ ] Implementar `save(alert)` — serializar `OrbitalAlert` para row usando `SqliteResultRowExternal` — `pending`
- [ ] Implementar `findAll()` — buscar rows, reconstruir `OrbitalAlert` via static factories — `pending`
- [ ] Implementar `findByStatus(status)` — query com `WHERE status = ?` — `pending`
- [ ] Confirmar todos os testes passam — `pending`

---

## Fase 21 — Application: Config e DI Container

- [ ] Criar `src/application/config/env.ts` — schema Zod: `APP_ENV`, `GLOBE_UPDATE_INTERVAL_MS`, `HIDDEN_TRIGGER_TAPS` — `pending`
- [ ] Chamar `schema.parse(process.env)` e exportar `env` tipado — `pending`
- [ ] Criar `.env` com valores de desenvolvimento — `pending`
- [ ] Criar `src/application/container/container.ts` — instanciar na ordem correta (adapters → gateways → services → repositories → usecases) — `pending`
- [ ] Instanciar `SqliteService` e chamar `initialize()` no startup — `pending`
- [ ] Instanciar `SqliteAlertHistoryRepository(sqliteService)` — `pending`
- [ ] Instanciar `AcknowledgeAlert(storageGateway, alertHistoryRepository)` — `pending`
- [ ] Exportar `container as const` e tipo `Container` — `pending`
- [ ] Criar `src/application/container/container-context.tsx` com `ContainerProvider` — `pending`
- [ ] Criar `src/presentation/hooks/use-di.ts`: `useDI<K extends keyof Container>(key: K)` — `pending`
- [ ] Adicionar `ContainerProvider` no `src/app/_layout.tsx` — `pending`

---

## Fase 22 — Application: Zustand Stores

- [ ] Criar `src/application/stores/use-orbital-store.test.ts` — `pending`
- [ ] Criar mocks de `ISatelliteRepository` e `PropagateOrbits` — `pending`
- [ ] Teste: `loadSatellites()` popula `satellites` — `pending`
- [ ] Teste: `propagatePositions(now)` popula `positions` — `pending`
- [ ] Teste: `isLoading` é `true` durante e `false` após carregamento — `pending`
- [ ] Criar `src/application/stores/use-orbital-store.ts` — `pending`
- [ ] Criar `src/application/stores/use-alert-store.test.ts` — `pending`
- [ ] Criar mocks de `IConjunctionRepository` e `IAlertHistoryRepository` — `pending`
- [ ] Teste: `loadConjunctions()` popula `conjunctions` — `pending`
- [ ] Teste: `loadAlertHistory()` popula `alertHistory` via `IAlertHistoryRepository.findAll()` — `pending`
- [ ] Teste: `triggerAlert()` seta `activeAlert` com primeira conjunção CRITICAL — `pending`
- [ ] Teste: `acknowledgeCurrentAlert()` → chama use case → persiste no SQLite (via mock) — `pending`
- [ ] Teste: `dismissAlert()` seta `activeAlert` para `null` — `pending`
- [ ] Criar `src/application/stores/use-alert-store.ts` com todas as actions — `pending`
- [ ] Criar `src/application/stores/index.ts` — `pending`
- [ ] Confirmar todos os testes passam — `pending`

---

## Fase 23 — Globe: HTML e globe.gl

- [ ] Criar `src/presentation/components/globe-view/globe.html` — `pending`
- [ ] Carregar globe.gl via CDN (unpkg.com) no `<script>` — `pending`
- [ ] Inicializar `Globe()` no `<div id="globe">` após DOM ready — `pending`
- [ ] Configurar globo: `globeImageUrl`, `backgroundColor('rgba(0,0,0,0)')`, `atmosphereColor` — `pending`
- [ ] Adicionar layer de pontos com `pointColor` diferenciado por tipo — `pending`
- [ ] Adicionar layer de arcos para `ConjunctionLine` com animação pulse — `pending`
- [ ] Implementar `window.addEventListener('message')` com handlers para cada comando — `pending`
- [ ] Handler `UPDATE_POSITIONS` — `pending`
- [ ] Handler `HIGHLIGHT_CONJUNCTION` — `pending`
- [ ] Handler `CLEAR_HIGHLIGHT` — `pending`
- [ ] Handler `DIM_GLOBE` e `UNDIM_GLOBE` — `pending`
- [ ] Configurar auto-rotação suave (`autoRotate: true`, `autoRotateSpeed: 0.5`) — `pending`

---

## Fase 24 — Presentation: Hooks

- [ ] Criar `src/presentation/hooks/use-orbital-loop.test.ts` — `pending`
- [ ] Teste: loop chama `propagatePositions` a cada intervalo — `pending`
- [ ] Teste: cleanup cancela o interval — `pending`
- [ ] Criar `src/presentation/hooks/use-orbital-loop.ts` — `pending`
- [ ] Criar `src/presentation/hooks/use-hidden-trigger.test.ts` — `pending`
- [ ] Teste: 5 taps no canto superior direito dentro de 1.5s dispara `onTrigger` — `pending`
- [ ] Teste: 5 taps fora do canto não dispara — `pending`
- [ ] Teste: intervalo > 1.5s entre taps reseta contador — `pending`
- [ ] Teste: 4 taps não dispara — `pending`
- [ ] Criar `src/presentation/hooks/use-hidden-trigger.ts` — `pending`
- [ ] Criar `src/presentation/hooks/use-presentation-mode.test.ts` — `pending`
- [ ] Teste: `toggle()` alterna `isPresentationMode` — `pending`
- [ ] Teste: estado persiste via `IStorageGateway` mockado — `pending`
- [ ] Criar `src/presentation/hooks/use-presentation-mode.ts` — `pending`
- [ ] Confirmar todos os testes de hooks passam — `pending`

---

## Fase 25 — Presentation: Componentes e Telas

- [ ] Criar `src/presentation/components/globe-view/globe-view.tsx` — WebView com ref, `IGlobeGlAdapter` via `useImperativeHandle` — `pending`
- [ ] Criar `src/presentation/components/alert-card/alert-card.tsx` — glassmorphism com `expo-blur` — `pending`
- [ ] Exibir severity badge, nomes, Pc, MissDistance, TCPA, recomendação, janela de ação — `pending`
- [ ] Animar entrada com `useAnimatedStyle` + `withSpring` (Reanimated 4 worklet) — `pending`
- [ ] Criar `src/presentation/components/conjunction-item/conjunction-item.tsx` — severity bar + dados — `pending`
- [ ] Criar `src/presentation/screens/globe-screen.tsx` — GlobeView em `absoluteFill` — `pending`
- [ ] Integrar `useHiddenTrigger` → `triggerAlert()` — `pending`
- [ ] Criar shared value `globeDimOpacity`, sincronizar dim + AlertCard surgimento — `pending`
- [ ] Disparar `ExpoHapticsGateway.warn()` no trigger — `pending`
- [ ] Criar `src/presentation/screens/alert-detail-screen.tsx` — modal com `expo-blur` — `pending`
- [ ] Chamar `acknowledgeCurrentAlert()` ao montar — persiste no SQLite — `pending`
- [ ] Criar `src/presentation/screens/conjunction-list-sheet.tsx` — bottom sheet manual com Reanimated — `pending`
- [ ] Seção "Ativas" — conjunções mockadas; seção "Histórico" — alertas do SQLite — `pending`
- [ ] Implementar swipe-down para fechar com gesture handler — `pending`
- [ ] Criar `src/presentation/screens/onboarding-screen.tsx` — verificar flag + salvar ao confirmar — `pending`

---

## Fase 26 — Navegação e Tema

- [ ] Atualizar `src/app/_layout.tsx` — Stack puro, `ContainerProvider` como wrapper raiz — `pending`
- [ ] Criar `src/app/alert-detail.tsx` — rota com `presentation: 'modal'` — `pending`
- [ ] Remover `src/app/explore.tsx` e `src/components/app-tabs.tsx` — `pending`
- [ ] Atualizar `src/constants/theme.ts` com paleta glassmorphism dark completa — `pending`
- [ ] Adicionar cores: `alert.critical`, `alert.warning`, `alert.info` — `pending`
- [ ] Adicionar cores: `satellite`, `debris`, `conjunctionLine` — `pending`
- [ ] Adicionar tokens: `glass.background`, `glass.border` — `pending`
- [ ] Criar `src/shared/utils/formatters.ts` com `formatPc`, `formatDistance`, `formatTcpa` — `pending`
- [ ] Criar `src/shared/utils/formatters.test.ts` e testar cada formatter — `pending`

---

## Fase 27 — Polish, Cobertura e Demo

- [ ] Rodar `npm run test:coverage` — garantir ≥ 90% em todas as camadas — `pending`
- [ ] Corrigir quaisquer gaps de cobertura identificados — `pending`
- [ ] Verificar auto-rotação suave do globo — `pending`
- [ ] Verificar spring animation do AlertCard sem jank (worklet na UI thread) — `pending`
- [ ] Verificar sincronização: globo dim + AlertCard + haptics no mesmo frame — `pending`
- [ ] Testar fluxo completo: abertura → globo → 5 taps → alerta → detail → SQLite persiste → lista com histórico — `pending`
- [ ] Verificar seção "Histórico" na ConjunctionListSheet exibe alertas do SQLite — `pending`
- [ ] Testar primeiro acesso: apagar flag MMKV e verificar onboarding — `pending`
- [ ] Verificar PresentationMode oculta elementos corretos — `pending`
- [ ] Testar em iOS e Android — `pending`
- [ ] Gravar vídeo de backup da demo completa — `pending`
