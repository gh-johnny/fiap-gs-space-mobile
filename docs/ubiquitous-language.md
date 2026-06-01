# Linguagem Ubíqua — Orbital Guardian Mobile

Este documento define os termos canônicos do domínio. Todo código, comentário,
variável, classe e conversa usa estes termos exatamente como definidos aqui.
Sinônimos são proibidos — use sempre o termo canônico.

---

## Objetos Orbitais

### SatelliteObject
Qualquer objeto rastreado em órbita. Pode ser um satélite operacional, um detrito
ou um estágio de foguete abandonado. Identificado por seu `NoradId`.

Criado exclusivamente via `SatelliteObject.create(params)` — `private constructor`.

**Subtipos (`SatelliteObjectType`):**
- `OPERATIONAL_SATELLITE` — satélite ativo, controlado
- `DEBRIS` — fragmento ou objeto inoperante
- `ROCKET_BODY` — estágio de lançador abandonado

**Não usar:** "objeto espacial", "item", "entidade orbital"

---

### NoradId
Identificador numérico único atribuído pelo USSF a cada objeto rastreado.
Branded type — não é um `number` qualquer.

Criado via `NoradId.create(value: number)` — valida inteiro positivo.

**Não usar:** "id", "objectId", "catalogNumber"

---

### TLEData (Two-Line Element)
Representação padronizada da órbita em duas linhas de texto. Perde precisão após
~14 dias — após isso o TLE é considerado `expired`.

Criado via `TLEData.create(line1, line2)` — valida formato.

**Não confundir com:** `TleRecordExternal` — formato bruto do JSON bundled (tipo externo, vive em `infrastructure/`).

**Não usar:** "dados orbitais", "tle string"

---

### OrbitPosition
Posição de um `SatelliteObject` num instante, em lat/lng/alt (WGS84).
Tipo interno — nunca expõe tipos do `satellite.js`.

**Não usar:** "coordenadas", "localização"

---

## Eventos de Risco

### ConjunctionEvent
Evento em que dois `SatelliteObject`s se aproximam perigosamente.
Contém: par de objetos, `ProbabilityOfCollision`, `MissDistance`, `TimeToClosestApproach`, `Severity`.

Criado via `ConjunctionEvent.create(params)`.

**Não usar:** "aproximação", "near miss", "colisão iminente"

---

### ProbabilityOfCollision (Pc)
Probabilidade calculada de colisão num `ConjunctionEvent`. Branded value object.

Criado via `ProbabilityOfCollision.create(value: number)` — valida `0 ≤ value ≤ 1`.

**Limiares:**
- `Pc > 1e-4` → `CRITICAL`
- `1e-5 < Pc ≤ 1e-4` → `WARNING`
- `Pc ≤ 1e-5` → `INFO`

**Métodos:** `exceedsThreshold()`, `toSeverity()`, `toScientificNotation()`

**Não usar:** "chance de colisão", "risco percentual"

---

### MissDistance
Distância mínima prevista no ponto de máxima aproximação. Em metros.

Criado via `MissDistance.create(meters: number)` — valida `≥ 0`.

**Regra:** `< 1000m` → crítico independente do Pc.

**Métodos:** `isDangerous()`, `isCritical()`, `toDisplayString()`

**Não usar:** "distância de passagem", "separação"

---

### TimeToClosestApproach (TCPA)
Tempo restante até a máxima aproximação.

Criado via `TimeToClosestApproach.create(date: Date)`.

**Métodos:** `actionWindowIsOpen()`, `toDisplayString()`, `toUtcString()`

**Não usar:** "countdown", "time to impact"

---

### Severity
Classificação de risco. Tipo union literal:
- `'CRITICAL'` — Pc > 1e-4 ou MissDistance < 1000m
- `'WARNING'` — Pc entre 1e-5 e 1e-4
- `'INFO'` — Pc ≤ 1e-5

**Não usar:** "level", "prioridade"

---

## Alertas

### OrbitalAlert
Um `ConjunctionEvent` que atingiu o limiar de notificação. Tem ciclo de vida próprio.
Persistido no SQLite quando acknowledged ou dismissed.

Criado via `OrbitalAlert.create(conjunctionEvent)`.

**AlertStatus — ciclo de vida:**
```
detected → acknowledged → dismissed
```

**Métodos:** `acknowledge(): OrbitalAlert`, `dismiss(): OrbitalAlert` — imutáveis, retornam nova instância.

**Não usar:** "notification", "aviso"

---

### AlertHistory
Coleção de `OrbitalAlert`s persistidos no SQLite. Acessível via `IAlertHistoryRepository`.
Exibida no `ConjunctionListSheet` junto com as conjunções ativas mockadas.

**Não usar:** "log de alertas", "histórico de eventos"

---

### HiddenTrigger
Gesto de 5 taps rápidos no canto superior direito que cria um `OrbitalAlert`.
Invisível na demo. Implementado em `use-hidden-trigger.ts`.

**Não usar:** "easter egg", "trigger manual"

---

## Propagação Orbital

### OrbitalPropagation
Processo de calcular `OrbitPosition` de um `SatelliteObject` dado seu `TLEData`.
Use case: `PropagateOrbits`.

### SGP4
Algoritmo padrão da indústria desde 1980. Implementado via `satellite.js`.
Encapsulado no `SatelliteJsAdapter` — nunca chamado diretamente fora do adapter.

### ConjunctionDetection
Identificação de pares que formarão um `ConjunctionEvent`.
Use case: `DetectConjunctions`.

---

## Infraestrutura de Domínio

### TleGateway
Fonte de `TLEData`. Interface: `ITleGateway`.
Implementação atual: `MockTleGateway`. Futura: `SpaceTrackGateway`.

### StorageGateway
Persistência KV local. Interface: `IStorageGateway`.
Implementação: `MmkvStorageGateway` (react-native-mmkv).
Persiste: flag de onboarding, modo de apresentação, preferências.

**Não confundir com:** `IAlertHistoryRepository` — persiste entidades de domínio no SQLite.

### HapticsGateway
Feedback tátil. Interface: `IHapticsGateway`.
Implementação: `ExpoHapticsGateway`.

### AlertHistoryRepository
Persistência de `OrbitalAlert` no SQLite. Interface: `IAlertHistoryRepository`.
Implementação: `SqliteAlertHistoryRepository`.

**Métodos:** `save(alert)`, `findAll()`, `findByStatus(status)`

### SqliteService
Serviço de infraestrutura que gerencia a conexão SQLite e executa migrations.
Não é um repositório — é um serviço técnico injetado nos repositórios SQLite.

---

## Padrões Arquiteturais

### StaticFactory
Padrão obrigatório em entidades e value objects.
`private constructor` + `static create(params)` com validação de invariantes.

```typescript
// ✅ correto
const id = NoradId.create(44713)
const sat = SatelliteObject.create({ noradId: id, ... })

// ❌ proibido — constructor privado
const id = new NoradId(44713)
```

### AntiCorruptionLayer
Fronteira explícita entre tipos externos de libs e tipos internos do domínio.
Implementada nos adapters e repositórios de infraestrutura.

**Tipos externos** — `*-external-types.ts`, vivem em `infrastructure/`:
- `TleRecordExternal` — formato do `tles.json`
- `SatRecExternal`, `EciVec3External` — tipos do `satellite.js`
- `GlobePointData`, `GlobeArcData` — tipos do `globe.gl`
- `SqliteResultRowExternal` — row do `expo-sqlite`

**Regra:** o domínio **nunca** importa de `*-external-types.ts`.

---

## Visualização

### GlobeView
Componente 3D via WebView + globe.gl. Comunicação via `GlobeGlAdapter`.

### GlobeGlAdapter
Anti-corruption layer: `OrbitPosition[]` → comandos postMessage do globe.gl.

### ConjunctionLine
Linha pulsante vermelha no globo conectando os dois objetos de um `ConjunctionEvent` ativo.

### PresentationMode
Estado que oculta elementos de UI desnecessários para a demo.
Ativado por long press de 2s no centro do globo. Persiste via `IStorageGateway`.
