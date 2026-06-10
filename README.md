# Orbital Guardian Mobile

> **FIAP Global Solution 2026** — Aplicativo mobile de monitoramento de risco orbital em tempo real

---

## Integrantes

| Nome | RM |
|------|----|
| João Marcelo Furtado Romero | RM555199 |
| André Nakamatsu Rocha | RM555004 |
| Matheus Riveira Montovaneli | RM555499 |

---

## Showcase

<p align="center">
  <img src="docs/assets/showcase.gif" alt="Orbital Guardian — demo" width="300" />
</p>

> GIF dos primeiros 30 segundos. Vídeo completo em [`docs/assets/showcase.mp4`](docs/assets/showcase.mp4).

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Contexto Acadêmico](#2-contexto-acadêmico)
3. [Narrativa do Produto](#3-narrativa-do-produto)
4. [Conceitos de Negócio](#4-conceitos-de-negócio)
   - 4.1 [O que é uma Conjunção Orbital?](#41-o-que-é-uma-conjunção-orbital)
   - 4.2 [Probabilidade de Colisão (Pc)](#42-probabilidade-de-colisão-pc)
   - 4.3 [Miss Distance](#43-miss-distance)
   - 4.4 [Time to Closest Approach (TCPA)](#44-time-to-closest-approach-tcpa)
   - 4.5 [Severity — Classificação de Risco](#45-severity--classificação-de-risco)
   - 4.6 [SGP4 e TLE — Física Orbital Real](#46-sgp4-e-tle--física-orbital-real)
   - 4.7 [Por que existe o toggle Simples / Técnico?](#47-por-que-existe-o-toggle-simples--técnico)
   - 4.8 [O que é um satélite controlável?](#48-o-que-é-um-satélite-controlável)
5. [Telas e Funcionalidades](#5-telas-e-funcionalidades)
   - 5.1 [Onboarding](#51-onboarding)
   - 5.2 [Globe View — Tela Principal](#52-globe-view--tela-principal)
   - 5.3 [Alert Detail — Modal de Alerta](#53-alert-detail--modal-de-alerta)
   - 5.4 [Conjunction List — Bottom Sheet](#54-conjunction-list--bottom-sheet)
6. [Fluxo Completo da Demo](#6-fluxo-completo-da-demo)
7. [Identidade Visual](#7-identidade-visual)
8. [Personas](#8-personas)
9. [Fora do Escopo](#9-fora-do-escopo)
10. [Arquitetura Técnica](#10-arquitetura-técnica)
    - 10.1 [Visão em Camadas](#101-visão-em-camadas)
    - 10.2 [Princípios Arquiteturais](#102-princípios-arquiteturais)
    - 10.3 [Padrão Static Factory](#103-padrão-static-factory)
    - 10.4 [Anti-Corruption Layer](#104-anti-corruption-layer)
    - 10.5 [Dependency Injection Manual](#105-dependency-injection-manual)
11. [Estrutura de Pastas](#11-estrutura-de-pastas)
12. [Domínio (src/core)](#12-domínio-srcore)
    - 12.1 [Entidades](#121-entidades)
    - 12.2 [Value Objects](#122-value-objects)
    - 12.3 [Use Cases](#123-use-cases)
    - 12.4 [Interfaces de Repositórios e Gateways](#124-interfaces-de-repositórios-e-gateways)
13. [Infraestrutura (src/infrastructure)](#13-infraestrutura-srcinfrastructure)
    - 13.1 [Adapters](#131-adapters)
    - 13.2 [Gateways](#132-gateways)
    - 13.3 [Repositórios Mock](#133-repositórios-mock)
    - 13.4 [Persistência SQLite](#134-persistência-sqlite)
14. [Camada de Aplicação (src/application)](#14-camada-de-aplicação-srcapplication)
    - 14.1 [Container de DI](#141-container-de-di)
    - 14.2 [Stores Zustand](#142-stores-zustand)
15. [Apresentação (src/presentation)](#15-apresentação-srcpresentation)
    - 15.1 [Screens](#151-screens)
    - 15.2 [Componentes](#152-componentes)
    - 15.3 [Hooks de Apresentação](#153-hooks-de-apresentação)
16. [Visualização 3D — Globe.gl + WebView](#16-visualização-3d--globegl--webview)
17. [Propagação Orbital — SGP4 via satellite.js](#17-propagação-orbital--sgp4-via-satellitejs)
18. [Animações — Reanimated 4](#18-animações--reanimated-4)
19. [Persistência Local — SQLite e MMKV](#19-persistência-local--sqlite-e-mmkv)
20. [i18n — Internacionalização](#20-i18n--internacionalização)
21. [Push Notifications](#21-push-notifications)
22. [Location Beacon](#22-location-beacon)
23. [Haptics](#23-haptics)
24. [Tech Stack Completa](#24-tech-stack-completa)
25. [Dependências](#25-dependências)
26. [Como Rodar o Projeto](#26-como-rodar-o-projeto)
27. [Testes](#27-testes)
    - 27.1 [Configuração](#271-configuração)
    - 27.2 [Metas de Cobertura](#272-metas-de-cobertura)
    - 27.3 [Casos de Teste Documentados](#273-casos-de-teste-documentados)
28. [Convenções de Nomenclatura](#28-convenções-de-nomenclatura)
29. [Linguagem Ubíqua](#29-linguagem-ubíqua)

---

## 1. Visão Geral

Orbital Guardian Mobile é um aplicativo React Native (Expo) que simula uma estação terrestre de monitoramento de risco orbital. O usuário visualiza satélites reais em órbita num globo 3D interativo, recebe alertas quando dois objetos estão em rota de colisão, e pode inspecionar todos os dados técnicos do evento — probabilidade de colisão, distância mínima de passagem, janela de ação e recomendação de manobra.

O aplicativo demonstra física orbital real (propagação SGP4), clean architecture em TypeScript, e uma interface premium com glassmorphism dark, animações Reanimated 4 e visualização via globe.gl.

---

## 2. Contexto Acadêmico

**Disciplina:** Global Solution 2026 — FIAP  
**Semestre:** 3º ano  
**Objetivo do projeto:** Demonstrar domínio de arquitetura de software, DDD, TDD e tecnologias mobile modernas num contexto de aplicação crítica (monitoramento espacial).

O projeto é totalmente mockado — sem backend, sem autenticação, sem dados em tempo real da Space-Track.org. Os TLEs (elementos orbitais) dos satélites são bundled no app (`src/data/tles.json`) e a propagação ocorre localmente. A única persistência real é o histórico de alertas reconhecidos, salvo em SQLite no próprio dispositivo.

---

## 3. Narrativa do Produto

A narrativa usada no onboarding e na apresentação:

> *"A mesma engine de risco que nasceu para resolver o problema mais difícil do mundo — colisão orbital a 28.000 km/h — é a prova de conceito de uma plataforma que pode ser aplicada em qualquer domínio de tráfego: terrestre, marítimo, aéreo."*

O Orbital Guardian nasceu como um sistema de monitoramento de conjunções para operadores de satélites. O app mobile é o "companion" desse ecossistema: ele traz a experiência do operador de sala de controle para o bolso de qualquer pessoa.

---

## 4. Conceitos de Negócio

### 4.1 O que é uma Conjunção Orbital?

Uma **conjunção orbital** (ou `ConjunctionEvent` no código) é um evento em que dois objetos em órbita terrestre se aproximam perigosamente, com risco real de colisão.

No espaço, não há freio. A velocidade relativa entre dois objetos pode chegar a **14 km/s** (50.400 km/h). Uma colisão nessa velocidade fragmenta os objetos em milhares de detritos — cada fragmento vira um novo projétil em órbita (fenômeno chamado de **Síndrome de Kessler**).

No app, uma conjunção é detectada quando dois `SatelliteObject`s estão a menos de **50 km** de distância na órbita calculada. A partir daí, o sistema calcula a probabilidade de colisão e classifica o risco.

**Termos proibidos:** "aproximação", "near miss", "colisão iminente" — o termo correto é sempre `ConjunctionEvent`.

### 4.2 Probabilidade de Colisão (Pc)

A **Probabilidade de Colisão** (`ProbabilityOfCollision`) é um número entre `0` e `1` que representa a chance estatística de impacto dado o `ConjunctionEvent`. No contexto orbital real, valores acima de `1 × 10⁻⁴` (0,01%) já são considerados críticos e exigem manobra evasiva imediata.

No app, o Pc é derivado da distância de aproximação:

| Distância | Pc gerado | Severidade |
|-----------|-----------|------------|
| < 500m | `5 × 10⁻⁴` | CRITICAL |
| 500m–5km | `5 × 10⁻⁵` | WARNING |
| > 5km | `5 × 10⁻⁶` | INFO |

A tela de detalhe exibe o Pc em notação científica com superscript Unicode: `1.4 × 10⁻³`.

**Limiares oficiais:**
- `Pc > 1 × 10⁻⁴` → **CRITICAL** — manobra obrigatória
- `1 × 10⁻⁵ < Pc ≤ 1 × 10⁻⁴` → **WARNING** — monitoramento ativo
- `Pc ≤ 1 × 10⁻⁵` → **INFO** — sem ação

**Termos proibidos:** "chance de colisão", "risco percentual".

### 4.3 Miss Distance

A **Miss Distance** (`MissDistance`) é a distância mínima prevista entre os dois objetos no momento de máxima aproximação. Medida em metros.

Uma `MissDistance < 1000m` (1 km) eleva automaticamente o evento para **CRITICAL**, independentemente do valor de Pc — porque nessa escala o modelo matemático já não garante precisão suficiente para descartar colisão.

**Métodos:**
- `isCritical()` — `true` se `< 1000m`
- `isDangerous()` — `true` se `< 5000m`
- `toDisplayString()` — formata como `"847m"` ou `"12.4km"`

**Termos proibidos:** "distância de passagem", "separação".

### 4.4 Time to Closest Approach (TCPA)

O **Time to Closest Approach** (`TimeToClosestApproach`) é o instante futuro em que os dois objetos estarão na máxima aproximação. A "janela de ação" é o tempo disponível para executar uma manobra evasiva antes que o evento ocorra.

**Métodos:**
- `actionWindowIsOpen()` — `true` enquanto o TCPA ainda está no futuro
- `toDisplayString()` — formata como `"4h 23min"`
- `toUtcString()` — formata como `"14:37 UTC"`

**Termos proibidos:** "countdown", "time to impact".

### 4.5 Severity — Classificação de Risco

A **Severity** é o nível de criticidade de um `ConjunctionEvent`. É computada automaticamente no construtor da entidade com a seguinte lógica de precedência:

```
MissDistance.isCritical() (< 1000m)  →  CRITICAL  (tem precedência sobre Pc)
Pc > 1e-4                            →  CRITICAL
1e-5 < Pc ≤ 1e-4                    →  WARNING
Pc ≤ 1e-5                           →  INFO
```

Essa regra existe porque uma distância de passagem muito pequena é perigosa mesmo que o modelo probabilístico indique baixo risco — incertezas nos dados do TLE podem esconder o perigo real.

**Termos proibidos:** "level", "prioridade".

### 4.6 SGP4 e TLE — Física Orbital Real

**TLE (Two-Line Element)** é o formato padrão da indústria para descrever a órbita de um objeto. Cada satélite tem duas linhas de texto codificadas com parâmetros como inclinação, excentricidade, semi-eixo maior e época:

```
1 25544U 98067A   24001.50000000  .00001234  00000-0  12345-4 0  9999
2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.50377579123456
```

Os TLEs perdem precisão após ~14 dias — após esse período são considerados `expired` pelo `TLEData.isExpired()`.

**SGP4 (Simplified General Perturbations 4)** é o algoritmo padrão da indústria desde 1980 para propagar TLEs no tempo e calcular a posição do satélite em lat/lng/alt (WGS84). O app usa a biblioteca `satellite.js` para executar esse cálculo, encapsulada no `SatelliteJsAdapter`.

A propagação ocorre a cada **500ms** no loop orbital (`useOrbitalLoop`), recalculando as posições de todos os 26 satélites e enviando para o globo 3D via WebView.

### 4.7 Por que existe o toggle Simples / Técnico?

A tela de Alert Detail exibe os mesmos dados de duas formas distintas:

**Modo Técnico** (padrão para operadores):
- Probabilidade de Colisão: `1.4 × 10⁻³`
- Miss Distance: `847m`
- TCPA: `14:37 UTC`
- Severidade: `CRITICAL`

**Modo Simples** (para cidadãos/observadores):
- Risco de colisão: `Alto`
- Distância mínima: `cerca de 1 km`
- Tempo restante: `em 4 horas`
- Status: `Situação crítica — ação necessária`

A razão de existir é que o app tem duas personas: o **operador** (que precisa dos números exatos para decidir sobre uma manobra evasiva) e o **cidadão/observador** (que quer entender o evento sem precisar conhecer notação científica ou acrônimos da indústria espacial).

O estado do toggle fica na `useUIStore` e persiste entre sessões via SQLite KV.

### 4.8 O que é um satélite controlável?

Um objeto orbital é **controlável** se for do tipo `OPERATIONAL_SATELLITE` — ou seja, um satélite com propulsão ativa que pode executar manobras evasivas.

Objetos não-controláveis (`DEBRIS`, `ROCKET_BODY`, `ASTEROID`) são fragmentos, estágios de foguetes abandonados ou asteroides — eles seguem a física, não recebem comandos. Quando ocorre uma conjunção entre um satélite e um detrito, **apenas o satélite pode manobrar**.

No app, essa distinção afeta:
- A **coloração no globo**: apenas satélites controláveis recebem a cor de risco (vermelho/laranja) durante uma conjunção. Detritos e asteroides mantêm sua cor neutra.
- A **geração de conjunções**: 90% das conjunções são entre um satélite controlável e um objeto não-controlável (cenário mais realista), 10% entre dois satélites controláveis.

---

## 5. Telas e Funcionalidades

### 5.1 Onboarding

Aparece em **todo acesso** (modo demo — flag `alwaysShow` ativada no `index.tsx`). Em produção, apareceria apenas no primeiro acesso, consultando a flag persistida no storage.

**3 slides animados:**

| Slide | Conteúdo |
|-------|----------|
| **Slide 1 — Marca** | Logo pulsante, título "Orbital Guardian", tagline "Monitoramento de risco orbital em tempo real" |
| **Slide 2 — Globo** | Ilustração do globo 3D, explicação do que o app exibe |
| **Slide 3 — Conjunções** | Explicação de conjunção orbital, CTA "Começar" |

**Features técnicas:**
- Star field procedural com distribuição golden-angle (Φ ≈ 137.5°) para evitar agrupamento de estrelas
- Transições horizontais com spring animation via Reanimated 4
- Emoji central pulsante (breathe animation — `withRepeat(withSequence(...))`)
- Cards glassmorphic com `expo-blur` para os feature cards
- Indicadores de progresso animados (dots com interpolação de opacidade e escala)
- Botão "Pular" funcional
- Suporte a EN/PT-BR via `useTranslation`

A flag de conclusão é gravada via `IStorageGateway` (`onboarding_completed = 'true'`).

### 5.2 Globe View — Tela Principal

Tela central do app. O globo 3D permanece como fundo em todas as navegações.

**O que o usuário vê:**
- Globo 3D rotacionando automaticamente com textura de satélite/mapa
- 26 satélites reais em órbitas calculadas via SGP4
- Pontos coloridos diferenciando satélites controláveis (azul ciano `#00D4FF`), detritos/asteroides (amarelo `#FFD60A`) e foguetes (`#FF9500`)
- Arcos vermelhos pulsantes conectando pares em conjunção
- Card de alerta flutuante com animação de entrada quando há evento ativo
- Mini banner de alerta quando a conjunction list sheet está aberta

**Interações disponíveis:**
- Toque num satélite → abre bottom sheet de controle do satélite
- Toque no card de alerta → navega para Alert Detail
- Toque em qualquer área → detecta HiddenTrigger (canto superior direito)
- Long press de 2s no centro do globo → ativa/desativa Presentation Mode
- Botão de lista → abre Conjunction List Sheet
- Ícone de configurações → abre Settings Overlay

**HiddenTrigger:** 5 taps rápidos (dentro de 1500ms) no canto superior direito (x > 80% da largura, y < 20% da altura) disparam manualmente um `OrbitalAlert`. É o mecanismo de demo para acionar o alerta durante uma apresentação sem esperar o timer aleatório.

**Loop orbital:** A cada 500ms, `useOrbitalLoop` chama `PropagateOrbits.execute()` com o timestamp atual, recalcula as posições de todos os satélites, e envia para o globo via `GlobeGlAdapter`. A cada tick, há **2% de chance** de spawnar uma nova conjunção aleatória (com limites de cap por corpo e global).

**Notificações:** Toda vez que `spawnRandomConjunction` cria um novo `ConjunctionEvent`, o app agenda uma push notification local via `ExpoNotificationGateway`.

**Location Beacon:** Se o usuário autorizou localização, um ponto ciano pulsante ("USER_BEACON") aparece no globo na posição atual do usuário.

### 5.3 Alert Detail — Modal de Alerta

Modal em stack (`animation: 'slide_from_bottom'`) sobre o globo. Abre ao tocar no card de alerta ou num item da conjunction list.

**Dados exibidos (modo técnico vs. simples):**

| Campo | Modo Técnico | Modo Simples |
|-------|-------------|--------------|
| Par de objetos | `STARLINK-1007 × DEBRIS-44100` | `Starlink × Detrito Espacial` |
| Probabilidade de Colisão | `1.4 × 10⁻³` | `Risco: Alto` |
| Miss Distance | `847m` | `Passarão a menos de 1 km` |
| TCPA | `14:37 UTC` | `Em aproximadamente 4 horas` |
| Janela de ação | `até 14:37 UTC` | `Aja antes das 14h37` |
| Recomendação | `Manobra evasiva recomendada` | `É necessária uma ação imediata` |
| Severidade badge | `CRITICAL ⚠️` | `Situação crítica` |

**Comportamentos:**
- Auto-acknowledge ao montar: `AcknowledgeAlert` use case é chamado, persistindo o alerta como `acknowledged` no SQLite
- Toggle Simples/Técnico no header (persiste via `useUIStore`)
- Botão "Fechar" → `dismissAlert()` → volta ao Globe View
- Feedback tátil (`impact('heavy')`) ao abrir

### 5.4 Conjunction List — Bottom Sheet

Desliza de baixo, mantendo o globo visível ao fundo. Exibe duas seções:

**Conjunções Ativas (mock):** Geradas em tempo de execução pelo `useAlertStore`. Ordenadas por severidade (CRITICAL → WARNING → INFO). Cada item mostra nomes dos dois objetos, tipos, badge de severidade, Pc em notação científica, miss distance e TCPA formatado.

**Histórico de Alertas (SQLite real):** Alertas acknowledged ou dismissed que foram persistidos no banco. Demonstra a integração SQLite real no projeto — lidos via `SqliteAlertHistoryRepository.findAll()`.

Tocar em qualquer item abre o Alert Detail correspondente.

---

## 6. Fluxo Completo da Demo

```
App abre
  ↓
[Sempre — modo demo] Onboarding (3 slides animados)
  Slide 1 (marca) → Slide 2 (globo) → Slide 3 (conjunções)
  → CTA "Começar"
  ↓
Globe View
  → Globo rotaciona, satélites se movem em órbitas reais (SGP4)
  → A cada 500ms: posições recalculadas e enviadas para o globo
  → A cada tick (2% de chance): nova conjunção spawna
      → Arco vermelho aparece no globo
      → Push notification agendada
      → Card de alerta surge com spring animation + vibração
  ↓
  [Opção A] Toque no card de alerta
    → Alert Detail (modal, slide from bottom)
    → Alerta auto-acknowledged → persistido no SQLite
    → Fechar → volta ao Globe View
  ↓
  [Opção B] 5 taps no canto superior direito
    → HiddenTrigger dispara alerta imediato (útil na apresentação)
  ↓
  [Opção C] Botão de lista
    → Conjunction List Sheet desliza de baixo
    → Lista de conjunções ativas + histórico SQLite
    → Toque em item → Alert Detail
  ↓
  [Opção D] Toque num satélite no globo
    → Satellite Control Sheet
    → Parâmetros orbitais, modo de operação, botão de correção
```

---

## 7. Identidade Visual

| Elemento | Cor | Uso |
|----------|-----|-----|
| Background | `#000000` / azul muito escuro | Base de todas as telas |
| Globo | Textura realista | Camada de fundo permanente |
| Cards | Blur + transparência | `expo-blur` + `expo-glass-effect` |
| Alerta CRITICAL | `#FF3B30` | Borda, badge, arco de conjunção |
| Alerta WARNING | `#FF9500` | Borda, badge, arco de conjunção |
| Alerta INFO | `#34C759` | Borda, badge |
| Satélites controláveis | `#00D4FF` | Pontos no globo |
| Detritos / Asteroides | `#FFD60A` | Pontos no globo |
| Rocket Bodies | `#FF9500` | Pontos no globo |
| Arco de conjunção | Vermelho pulsante | Linha entre os dois objetos |
| Location Beacon | Ciano pulsante | Posição do usuário |

**Estilo:** Glassmorphism dark. Todos os cards usam `expo-blur` com `intensity={20}` e bordas com 10–15% de opacidade branca.

---

## 8. Personas

| Persona | Papel no app |
|---------|-------------|
| **Cidadão/Observador** | Experiência principal — explora o globo 3D, entende risco orbital de forma acessível (modo simples) |
| **Operador** | Lê alertas com dados técnicos completos — Pc, miss distance, TCPA, recomendação de manobra (modo técnico) |

---

## 9. Fora do Escopo

- Backend, banco de dados remoto ou IA
- Dados financeiros (exposição em USD)
- Domínios marítimo, drones ou frota terrestre
- Autenticação e autorização
- Sincronização com Space-Track.org em runtime
- Persona seguradora ou reguladora

---

## 10. Arquitetura Técnica

O projeto segue **Onion Architecture** (também chamada Hexagonal ou Clean Architecture), com **Domain-Driven Design** no núcleo e injeção de dependência manual.

### 10.1 Visão em Camadas

```
┌─────────────────────────────────────────────────────────┐
│                     PRESENTATION                        │
│       Screens · Components · Hooks · i18n               │
├─────────────────────────────────────────────────────────┤
│                     APPLICATION                         │
│       Zustand Stores · DI Container · env.ts            │
├─────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE                       │
│    Adapters · Gateways · Repositories · Persistence     │
├─────────────────────────────────────────────────────────┤
│                    CORE (DOMAIN)                        │
│    Entities · Value Objects · Use Cases · Interfaces    │
└─────────────────────────────────────────────────────────┘
```

**Regras de dependência — sempre de fora para dentro:**
- `presentation` → `application` → `core`
- `infrastructure` → `core` (implementa interfaces)
- `core` **nunca** importa de `infrastructure`, `application` ou `presentation`
- `presentation` **nunca** importa de `infrastructure` diretamente

### 10.2 Princípios Arquiteturais

**SOLID aplicado:**

| Princípio | Como se manifesta |
|-----------|-------------------|
| **SRP** | Cada use case faz uma única coisa; cada adapter traduz um único tipo externo |
| **OCP** | `SpaceTrackGateway` substituiria `MockTleGateway` sem alterar nenhum use case |
| **LSP** | `SqliteAlertHistoryRepository` é completamente substituível por `MockAlertHistoryRepository` nos testes |
| **ISP** | `IStorageGateway` expõe apenas `get/set/remove` — nenhum detalhe de MMKV vaza |
| **DIP** | `presentation` e `core` dependem de interfaces; `infrastructure` é implementação |

**Object Calisthenics:**
- Sem primitivos soltos — `Pc`, `MissDistance`, `TCPA`, `NoradId` são value objects com comportamento
- Value objects expõem métodos ricos: `isDangerous()`, `exceedsThreshold()`, `actionWindowIsOpen()`
- Sem `else` aninhado — cada método tem uma única responsabilidade clara

### 10.3 Padrão Static Factory

Todas as entidades e value objects usam `private constructor` + `static create()`. Isso garante que a construção sempre passa pela validação de invariantes — é impossível criar um `NoradId` negativo, uma `ProbabilityOfCollision` maior que 1, ou um `SatelliteObject` sem nome.

```typescript
// ✅ correto — factory valida e constrói
const noradId = NoradId.create(25544)
const pc      = ProbabilityOfCollision.create(1.4e-3)
const sat     = SatelliteObject.create({ noradId, name: 'ISS', type, tleData })

// ❌ proibido — constructor é private
const noradId = new NoradId(25544)
```

Para reconstituição a partir do banco de dados (onde os dados já foram validados uma vez), `OrbitalAlert` expõe um segundo factory `static reconstruct(params)` que não regera IDs.

### 10.4 Anti-Corruption Layer

Tipos de bibliotecas externas (`satellite.js`, `globe.gl`, `expo-sqlite`) são isolados em arquivos `*-external-types.ts` que vivem **apenas em `infrastructure/`**. O domínio nunca vê esses tipos.

```
satellite.js (SatRecExternal, EciVec3)
    ↓  SatelliteJsAdapter traduz
OrbitPosition { noradId, lat, lng, alt }   ← tipo interno do domínio
    ↓  GlobeGlAdapter traduz
GlobePointData { lat, lng, alt, color }    ← tipo externo do globe.gl

tles.json (TleRecordExternal)
    ↓  MockTleGateway traduz
TLEData.create(line1, line2)               ← value object do domínio

expo-sqlite ResultSet Row
    ↓  SqliteAlertHistoryRepository traduz
OrbitalAlert.reconstruct(params)           ← entidade do domínio
```

### 10.5 Dependency Injection Manual

Não há framework de DI. O arquivo `container.ts` instancia tudo na ordem correta e exporta um objeto `as const`. Um único contexto React (`ContainerProvider`) distribui o container para todas as telas via `useContainer()` hook.

**Para trocar Mock → Real:** alterar **uma linha** em `container.ts`. Nenhum outro arquivo muda.

```typescript
// Trocar storage: uma linha
storageGateway: new SqliteKvStorageGateway(sqliteService)  // atual
storageGateway: new MmkvStorageGateway()                   // alternativa

// Trocar TLE gateway: uma linha
tleGateway: new MockTleGateway()     // atual (dados bundled)
tleGateway: new SpaceTrackGateway()  // futuro (API real)
```

---

## 11. Estrutura de Pastas

```
src/
├── core/                            # Domínio puro — zero dependências externas
│   ├── entities/
│   │   ├── satellite-object.ts      # Objeto orbital rastreável
│   │   ├── satellite-object.test.ts
│   │   ├── conjunction-event.ts     # Evento de aproximação perigosa
│   │   ├── conjunction-event.test.ts
│   │   ├── orbital-alert.ts         # Alerta disparado para o operador
│   │   ├── orbital-alert.test.ts
│   │   └── index.ts
│   ├── value-objects/
│   │   ├── norad-id.ts              # ID único de objeto orbital (branded type)
│   │   ├── norad-id.test.ts
│   │   ├── tle-data.ts              # Dados TLE validados
│   │   ├── tle-data.test.ts
│   │   ├── probability-of-collision.ts
│   │   ├── probability-of-collision.test.ts
│   │   ├── miss-distance.ts
│   │   ├── miss-distance.test.ts
│   │   ├── time-to-closest-approach.ts
│   │   ├── time-to-closest-approach.test.ts
│   │   └── index.ts
│   ├── repositories/                # Interfaces puras (sem implementação)
│   │   ├── i-satellite-repository.ts
│   │   ├── i-conjunction-repository.ts
│   │   ├── i-alert-history-repository.ts
│   │   └── index.ts
│   ├── gateways/                    # Interfaces puras (sem implementação)
│   │   ├── i-tle-gateway.ts
│   │   ├── i-storage-gateway.ts
│   │   ├── i-haptics-gateway.ts
│   │   ├── i-location-gateway.ts
│   │   ├── i-notification-gateway.ts
│   │   └── index.ts
│   └── usecases/
│       ├── propagate-orbits.ts      # SGP4: TLEData + timestamp → OrbitPosition[]
│       ├── propagate-orbits.test.ts
│       ├── detect-conjunctions.ts   # Haversine: OrbitPosition[] → ConjunctionEvent[]
│       ├── detect-conjunctions.test.ts
│       ├── classify-risk.ts         # MissDistance + Pc → Severity
│       ├── classify-risk.test.ts
│       ├── acknowledge-alert.ts     # OrbitalAlert detected → acknowledged + persist
│       ├── acknowledge-alert.test.ts
│       ├── i-satellite-js-adapter.ts
│       └── index.ts
│
├── infrastructure/                  # Implementações de infraestrutura
│   ├── adapters/
│   │   ├── satellite-js-adapter.ts          # satellite.js → OrbitPosition
│   │   ├── satellite-js-adapter.test.ts
│   │   ├── satellite-js-external-types.ts   # SatRecExternal, EciVec3External
│   │   ├── i-satellite-js-adapter.ts
│   │   ├── globe-gl-adapter.ts              # OrbitPosition → globe.gl commands
│   │   ├── globe-gl-external-types.ts       # GlobePointData, GlobeArcData
│   │   ├── i-globe-gl-adapter.ts
│   │   └── index.ts
│   ├── gateways/
│   │   ├── mock-tle-gateway.ts              # Carrega tles.json bundled
│   │   ├── mock-tle-gateway.test.ts
│   │   ├── tle-record-external.ts           # Formato do JSON bundled
│   │   ├── sqlite-kv-storage-gateway.ts     # KV via SQLite (substitui MMKV)
│   │   ├── expo-haptics-gateway.ts          # expo-haptics wrapper
│   │   ├── expo-location-gateway.ts         # expo-location wrapper
│   │   ├── expo-notification-gateway.ts     # expo-notifications wrapper
│   │   └── index.ts
│   ├── repositories/
│   │   ├── mock-satellite-repository.ts     # ISatelliteRepository em memória
│   │   ├── mock-satellite-repository.test.ts
│   │   ├── mock-conjunction-repository.ts   # IConjunctionRepository em memória
│   │   ├── mock-conjunction-repository.test.ts
│   │   └── index.ts
│   └── persistence/
│       ├── sqlite-service.ts                # Conexão + migrations SQLite
│       ├── sqlite-service.test.ts
│       ├── sqlite-alert-history-repository.ts   # IAlertHistoryRepository real
│       ├── sqlite-alert-history-repository.test.ts
│       ├── sqlite-external-types.ts         # Tipos do expo-sqlite
│       └── index.ts
│
├── application/                     # Orquestração: stores + DI + config
│   ├── container/
│   │   ├── container.ts             # Wiring de todo o grafo de dependências
│   │   └── container-context.tsx   # React Context + useContainer() hook
│   ├── config/
│   │   └── env.ts                  # Variáveis de ambiente com zod
│   └── stores/
│       ├── use-orbital-store.ts     # Satélites + posições orbitais
│       ├── use-orbital-store.test.ts
│       ├── use-alert-store.ts       # Conjunções + alertas + histórico
│       ├── use-alert-store.test.ts
│       ├── use-ui-store.ts          # Preferências de UI (modo, locale, toggle)
│       └── index.ts
│
├── presentation/                    # UI: screens, components, hooks
│   ├── screens/
│   │   ├── globe-screen.tsx         # Tela principal com globo 3D
│   │   ├── alert-detail-screen.tsx  # Modal de alerta
│   │   ├── conjunction-list-sheet.tsx
│   │   └── onboarding-screen.tsx
│   ├── components/
│   │   ├── globe-view/
│   │   │   ├── globe-view.tsx       # WebView wrapper do globe.gl
│   │   │   ├── globe.html           # HTML com globe.gl via CDN + bridge
│   │   │   └── index.ts
│   │   ├── alert-card/
│   │   │   ├── alert-card.tsx       # Card glassmorphic de alerta flutuante
│   │   │   ├── mini-alert-banner.tsx
│   │   │   └── index.ts
│   │   ├── conjunction-item/
│   │   │   ├── conjunction-item.tsx
│   │   │   └── index.ts
│   │   ├── satellite-control/
│   │   │   └── satellite-control-sheet.tsx
│   │   ├── settings-overlay/
│   │   │   └── settings-overlay.tsx
│   │   └── mode-toggle/
│   │       └── mode-toggle.tsx
│   ├── hooks/
│   │   ├── use-di.ts                # Acessa o DI container no contexto React
│   │   ├── use-orbital-loop.ts      # Intervalo de 500ms que propaga órbitas
│   │   ├── use-orbital-loop.test.ts
│   │   ├── use-hidden-trigger.ts    # 5 taps no canto → dispara alerta
│   │   ├── use-hidden-trigger.test.ts
│   │   ├── use-presentation-mode.ts
│   │   ├── use-presentation-mode.test.ts
│   │   └── index.ts
│   └── utils/
│       └── format-simple.ts         # Formatação para modo simples
│
├── i18n/
│   ├── translations.ts              # Strings EN/PT-BR
│   └── use-translation.ts           # Hook de tradução com locale do store
│
├── constants/
│   └── theme.ts                     # Paleta de cores e espaçamentos
│
├── shared/
│   ├── types/
│   │   └── index.ts                 # Tipos compartilhados entre camadas
│   └── utils/
│       ├── formatters.ts            # Pc, distance, TCPA formatters
│       └── formatters.test.ts
│
├── data/
│   └── tles.json                    # 26 satélites/detritos com TLEs reais
│
└── app/                             # Expo Router (file-based routing)
    ├── _layout.tsx                  # Stack + GestureHandlerRootView + ContainerProvider
    ├── index.tsx                    # Conditional: Onboarding OR GlobeScreen
    └── alert-detail.tsx             # Modal stack (slide_from_bottom)
```

---

## 12. Domínio (src/core)

### 12.1 Entidades

#### `SatelliteObject`

Qualquer objeto rastreado em órbita. Identificado pelo `NoradId`.

```typescript
enum SatelliteObjectType {
  OPERATIONAL_SATELLITE = 'OPERATIONAL_SATELLITE',
  DEBRIS                = 'DEBRIS',
  ROCKET_BODY           = 'ROCKET_BODY',
  ASTEROID              = 'ASTEROID',
}

class SatelliteObject {
  private constructor(
    readonly noradId: NoradId,
    readonly name:    string,
    readonly type:    SatelliteObjectType,
    readonly tleData: TLEData,
  ) {}

  static create(params): SatelliteObject  // valida nome não-vazio
  isControllable(): boolean               // true apenas para OPERATIONAL_SATELLITE
}
```

#### `ConjunctionEvent`

Evento de aproximação perigosa entre dois `SatelliteObject`s. A severity é computada no construtor com base em `MissDistance` e `Pc` — a regra de negócio vive na entidade, não no use case.

```typescript
class ConjunctionEvent {
  readonly objectA:     SatelliteObject
  readonly objectB:     SatelliteObject
  readonly pc:          ProbabilityOfCollision
  readonly missDistance: MissDistance
  readonly tcpa:        TimeToClosestApproach
  readonly severity:    Severity  // computada no construtor

  static create(params): ConjunctionEvent
  isActive(): boolean  // tcpa.actionWindowIsOpen()
}
```

#### `OrbitalAlert`

Um `ConjunctionEvent` que atingiu o limiar de notificação. Tem ciclo de vida próprio: `detected → acknowledged → dismissed`. É **imutável** — `acknowledge()` e `dismiss()` retornam novas instâncias sem mutar o objeto original.

```typescript
class OrbitalAlert {
  readonly id:               string        // "alert-{timestamp}-{random}"
  readonly conjunctionEvent: ConjunctionEvent
  readonly status:           AlertStatus   // 'detected' | 'acknowledged' | 'dismissed'
  readonly detectedAt:       Date

  static create(event):      OrbitalAlert  // status: 'detected', gera novo ID
  static reconstruct(params): OrbitalAlert // reconstitui do banco, preserva ID
  acknowledge():             OrbitalAlert  // nova instância, status: 'acknowledged'
  dismiss():                 OrbitalAlert  // nova instância, status: 'dismissed'
}
```

### 12.2 Value Objects

Todos criados exclusivamente via `static create()` com validação de invariantes. Nunca primitivos soltos.

| Value Object | Validação | Comportamento |
|---|---|---|
| `NoradId` | inteiro positivo | `equals(other)` |
| `TLEData` | linha 1 e 2 com 69 chars | `isExpired()` (> 14 dias da época) |
| `ProbabilityOfCollision` | `0 ≤ value ≤ 1` | `exceedsThreshold()`, `toSeverity()`, `toScientificNotation()` |
| `MissDistance` | `meters ≥ 0` | `isCritical()` (< 1000m), `isDangerous()` (< 5000m), `toDisplayString()` |
| `TimeToClosestApproach` | qualquer `Date` | `actionWindowIsOpen()`, `toDisplayString()`, `toUtcString()` |

**Exemplo — `ProbabilityOfCollision.toScientificNotation()`:**

```typescript
ProbabilityOfCollision.create(1.4e-3).toScientificNotation()
// → "1.4 × 10⁻³"   (superscripts Unicode, não HTML)
```

### 12.3 Use Cases

#### `PropagateOrbits`

Recebe `SatelliteObject[]` e um timestamp, chama `ISatelliteJsAdapter.propagate()` para cada satélite, filtra `null` (falha de propagação) e retorna `OrbitPosition[]`.

#### `DetectConjunctions`

Recebe `SatelliteObject[]` e `OrbitPosition[]`, calcula distâncias par-a-par via **haversine modificado** que considera altitude, e para pares com distância < 50km cria um `ConjunctionEvent`. Retorna a lista ordenada por severity (CRITICAL primeiro).

```typescript
// Haversine modificado — considera diferença de altitude
function distanceKm(a: OrbitPosition, b: OrbitPosition): number {
  const avgRadius = EARTH_RADIUS_KM + (a.alt + b.alt) / 2
  const surfaceKm = 2 * avgRadius * Math.asin(Math.sqrt(haversine))
  return Math.sqrt(surfaceKm ** 2 + (b.alt - a.alt) ** 2)
}
```

#### `ClassifyRisk`

Determina a `Severity` a partir de `MissDistance` e `Pc`. `MissDistance < 1000m` tem precedência — eleva para CRITICAL independente do Pc.

#### `AcknowledgeAlert`

Recebe um `OrbitalAlert`, chama `alert.acknowledge()` (retorna nova instância imutável), persiste via `IAlertHistoryRepository.save()` e via `IStorageGateway.set()`. Retorna o alerta acknowledged.

### 12.4 Interfaces de Repositórios e Gateways

Todas vivem em `src/core/`. Nunca contêm implementação.

| Interface | Métodos |
|---|---|
| `ISatelliteRepository` | `findAll(): Promise<SatelliteObject[]>` |
| `IConjunctionRepository` | `findAll()`, `findBySeverity(severity)` |
| `IAlertHistoryRepository` | `save(alert)`, `findAll()`, `findByStatus(status)` |
| `ITleGateway` | `fetchAll(): Promise<TleRecord[]>` |
| `IStorageGateway` | `get(key)`, `set(key, value)`, `remove(key)` |
| `IHapticsGateway` | `impact(style)`, `notification(type)` |
| `ILocationGateway` | `requestPermission()`, `getCurrentPosition()` |
| `INotificationGateway` | `requestPermission()`, `scheduleLocal(content)` |

---

## 13. Infraestrutura (src/infrastructure)

### 13.1 Adapters

#### `SatelliteJsAdapter`

Anti-corruption layer entre `satellite.js` e o domínio. Isola completamente os tipos da biblioteca.

```
TLEData (domínio) → twoline2satrec(line1, line2) → SatRecExternal
                  → propagate(satrec, date)       → EciVec3External
                  → eciToGeodetic(eci, gmst)      → GeodeticExternal
                  → OrbitPosition { noradId, lat, lng, alt }  (domínio)
```

Erros de propagação (posição inválida, NaN, órbita decaída) retornam `null` — filtrado pelo use case.

#### `GlobeGlAdapter`

Converte dados do domínio em comandos para o globe.gl, enviados via `WebView.postMessage(JSON.stringify(message))`:

| Método | Comando enviado | Efeito no globo |
|--------|----------------|-----------------|
| `updateSatellites(positions, satellites)` | `UPDATE_SATELLITES` | Atualiza pontos coloridos |
| `showConjunctionPairs(pairs)` | `SHOW_CONJUNCTION_PAIRS` | Exibe arcos de conjunção |
| `clearConjunctionPairs()` | `CLEAR_CONJUNCTION_PAIRS` | Remove todos os arcos |
| `addConjunctionPair(event)` | `ADD_CONJUNCTION_PAIR` | Adiciona arco incremental |
| `setDimmed(bool)` | `SET_DIMMED` | Ativa/desativa overlay escuro |
| `showUserBeacon(lat, lng)` | `SHOW_USER_BEACON` | Exibe ponto do usuário |

### 13.2 Gateways

| Gateway | Implementação | Função |
|---|---|---|
| `MockTleGateway` | Lê `tles.json` bundled | Retorna 26 objetos orbitais com TLEs reais |
| `SqliteKvStorageGateway` | `expo-sqlite` | KV store para flags e preferências de UI |
| `ExpoHapticsGateway` | `expo-haptics` | Feedback tátil (impact, notification) |
| `ExpoLocationGateway` | `expo-location` | Solicita permissão e retorna posição atual |
| `ExpoNotificationGateway` | `expo-notifications` | Agenda notificações locais por conjunção |

### 13.3 Repositórios Mock

- **`MockSatelliteRepository`:** chama `MockTleGateway.fetchAll()` e converte cada `TleRecordExternal` em `SatelliteObject` via static factory.
- **`MockConjunctionRepository`:** retorna 3 `ConjunctionEvent`s pré-definidos com severidades variadas, úteis para popular a conjunction list na inicialização.

### 13.4 Persistência SQLite

#### Schema

```sql
-- Histórico de alertas orbitais
CREATE TABLE IF NOT EXISTS orbital_alerts (
  id                        TEXT PRIMARY KEY,
  conjunction_object_a      TEXT NOT NULL,
  conjunction_object_b      TEXT NOT NULL,
  probability_of_collision  REAL NOT NULL,
  miss_distance_meters      REAL NOT NULL,
  time_to_closest_approach  TEXT NOT NULL,
  severity  TEXT NOT NULL CHECK(severity IN ('CRITICAL','WARNING','INFO')),
  status    TEXT NOT NULL CHECK(status IN ('detected','acknowledged','dismissed')),
  detected_at TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

-- KV Store (flags e preferências)
CREATE TABLE IF NOT EXISTS kv_store (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

#### Migrations

`SqliteService` mantém um array de migrations versionadas e executa apenas as pendentes na inicialização, controlando versão via `PRAGMA user_version`. As migrations são idempotentes.

#### Fluxo de persistência de alerta

```
OrbitalAlert criado (status: 'detected')
  ↓ useAlertStore.acknowledgeCurrentAlert(useCase)
  ↓ AcknowledgeAlert.execute(alert)
  ↓ alert.acknowledge()                              → nova instância imutável
  ↓ IAlertHistoryRepository.save(acknowledged)       ← interface
  ↓ SqliteAlertHistoryRepository.save(alert)         ← implementação real
  ↓ expo-sqlite INSERT OR REPLACE INTO orbital_alerts

ConjunctionListSheet abre
  ↓ useAlertStore.loadAlertHistory(repo)
  ↓ SqliteAlertHistoryRepository.findAll()
  ↓ SELECT * FROM orbital_alerts
  ↓ row → OrbitalAlert.reconstruct(params)           ← reconstitui entidades
  ↓ Exibe na seção "Histórico" do sheet
```

---

## 14. Camada de Aplicação (src/application)

### 14.1 Container de DI

`container.ts` é o único lugar onde `new` é chamado em implementações de infraestrutura. A ordem de inicialização importa — `SqliteService` deve ser inicializado antes dos gateways que dependem dele.

```typescript
// Ordem correta de inicialização
const sqliteService = new SqliteService()
sqliteService.initialize()                          // migrations executadas aqui

const storageGateway         = new SqliteKvStorageGateway(sqliteService)
const alertHistoryRepository = new SqliteAlertHistoryRepository(sqliteService)
const acknowledgeAlert       = new AcknowledgeAlert(storageGateway, alertHistoryRepository)

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
```

`ContainerProvider` envolve o root da aplicação no `_layout.tsx` e disponibiliza o container via `useContainer()` em qualquer componente.

### 14.2 Stores Zustand

#### `useOrbitalStore`

Gerencia satélites e posições orbitais.

| Estado | Tipo | Descrição |
|--------|------|-----------|
| `satellites` | `SatelliteObject[]` | Objetos carregados do repositório |
| `positions` | `OrbitPosition[]` | Posições calculadas no último tick |
| `isLoading` | `boolean` | Flag de carregamento inicial |

| Ação | Descrição |
|------|-----------|
| `loadSatellites(repo)` | Chama `repo.findAll()` e popula o store |
| `propagatePositions(useCase, timestamp)` | Executa `PropagateOrbits` e atualiza posições |
| `reset()` | Limpa o estado |

#### `useAlertStore`

Gerencia conjunções, alertas e histórico SQLite.

| Estado | Tipo | Descrição |
|--------|------|-----------|
| `conjunctions` | `ConjunctionEvent[]` | Conjunções ativas (cap: 20) |
| `alertHistory` | `OrbitalAlert[]` | Histórico do SQLite |
| `activeAlert` | `OrbitalAlert \| null` | Alerta sendo exibido na tela |
| `correctedCount` | `number` | Contador de manobras corretivas |

| Ação | Descrição |
|------|-----------|
| `loadConjunctions(repo)` | Carrega conjunções mock iniciais |
| `loadAlertHistory(repo)` | Carrega histórico do SQLite |
| `triggerAlert()` | Dispara alerta para a conjunção mais crítica |
| `triggerAlertFor(event)` | Dispara alerta para uma conjunção específica |
| `acknowledgeCurrentAlert(useCase)` | Acknowledge + persiste no SQLite |
| `dismissAlert()` | Fecha o alerta sem persistir |
| `spawnRandomConjunction(satellites)` | Gera nova conjunção aleatória com rate limiting |
| `seedAllConjunctions(satellites)` | Popula conjunções iniciais em batch |
| `removeConjunction(noradIdA, noradIdB)` | Remove conjunção por par de IDs |
| `incrementCorrected()` | Incrementa o contador de correções |

**Rate limiting de conjunções:**
- `MAX_CONJUNCTIONS = 20` — cap global de conjunções simultâneas
- `MAX_CONJUNCTIONS_PER_BODY = 2` — um satélite não aparece em mais de 2 conjunções ao mesmo tempo
- 2% de probabilidade por tick de spawnar nova conjunção
- 90% das conjunções: satélite controlável × objeto não-controlável (cenário realista)
- 10% das conjunções: satélite × satélite

#### `useUIStore`

Gerencia preferências de interface que persistem entre sessões.

| Estado | Descrição |
|--------|-----------|
| `isSimpleMode` | Toggle Simples/Técnico na Alert Detail |
| `locale` | `'en'` ou `'pt'` |
| `globeTexture` | Textura atual do globo |
| `notificationsEnabled` | Flag de push notifications ativas |
| `locationEnabled` | Flag de location beacon ativo |

---

## 15. Apresentação (src/presentation)

### 15.1 Screens

#### `GlobeScreen`

Tela principal. Orquestra o loop orbital, spawning de conjunções, card de alerta, e comunicação com o globo.

Fluxo de montagem:
1. `loadSatellites(satelliteRepository)` → obtém os 26 satélites
2. `globeAdapter.updateSatellites(positions, satellites)` → inicializa pontos no globo
3. `seedAllConjunctions(satellites)` → popula lista inicial
4. `globeAdapter.showConjunctionPairs(conjunctions)` → inicializa arcos
5. `useOrbitalLoop(500ms, tick)` → inicia o loop

A cada tick do loop:
1. `propagatePositions(propagateOrbits, Date.now())`
2. `globeAdapter.updateSatellites(positions, satellites)`
3. `Math.random() < 0.02` → `spawnRandomConjunction(satellites)` → se spawnou: `addConjunctionPair` + `triggerAlertFor` + agenda notificação

#### `AlertDetailScreen`

Modal. Na montagem, chama `acknowledgeCurrentAlert(acknowledgeAlert)` automaticamente. Renderiza a versão simples ou técnica de cada campo baseada em `isSimpleMode` da `useUIStore`.

#### `ConjunctionListSheet`

Bottom sheet com duas seções. Na montagem, carrega `alertHistory` do SQLite. Conjunções ativas vêm do `useAlertStore`.

#### `OnboardingScreen`

3 slides. O índice atual é controlado por `useSharedValue` (Reanimated). Botão avança slide ou conclui o onboarding.

### 15.2 Componentes

#### `GlobeView`

```typescript
interface GlobeViewProps {
  onReady: (adapter: IGlobeGlAdapter) => void
  onSatelliteTapped: (noradId: string) => void
}
```

Renderiza `WebView` carregando `globe.html`. Quando o HTML sinaliza `GLOBE_READY`, chama `onReady(adapter)`. Mensagens do globo são roteadas para `onSatelliteTapped`.

#### `AlertCard`

Card flutuante com `expo-blur` e borda colorida por severity. Anima a entrada com spring (Reanimated 4, `damping: 46`, `stiffness: 200`). Botões de acknowledge (abre Alert Detail) e dismiss.

#### `MiniAlertBanner`

Versão compacta do AlertCard, exibida quando o conjunction list sheet está aberto (o card principal ficaria oculto pelo sheet). Aguarda a animação do sheet para aparecer (delay de ~300ms).

#### `ConjunctionItem`

Item de lista: ícones dos tipos dos dois objetos, nomes, severity badge colorido, Pc em notação científica, miss distance, TCPA.

#### `SatelliteControlSheet`

Bottom sheet acionado ao tocar num satélite. Exibe nome, tipo, parâmetros orbitais, modo de operação (NOMINAL/ECO/SAFE) e botão de correção orbital (incrementa `correctedCount` no store).

#### `SettingsOverlay`

Toggle simples/técnico, seleção de locale (EN/PT-BR), toggle de localização e toggle de notificações.

#### `ModeToggle`

Toggle Simples ↔ Técnico com animação de slide. Persiste estado via `useUIStore`.

### 15.3 Hooks de Apresentação

#### `useOrbitalLoop`

```typescript
useOrbitalLoop(intervalMs: number, callback: () => void): void
```

Executa `callback` a cada `intervalMs` via `setInterval`. Limpa o intervalo no unmount. O loop principal roda a **500ms**.

#### `useHiddenTrigger`

```typescript
useHiddenTrigger({
  onTrigger,
  screenWidth,
  screenHeight,
  requiredTaps = 5,    // 5 taps
  windowMs    = 1500,  // dentro de 1.5s
}): { onTap: (x, y) => void }
```

Detecta 5 taps rápidos no canto superior direito (x > 80% da largura, y < 20% da altura). Taps fora do canto resetam o contador. A janela de tempo é rolante — taps mais antigos que `windowMs` são descartados a cada novo tap.

```typescript
// Thresholds de detecção do canto
const CORNER_X_THRESHOLD = 0.8  // x > 80% da largura
const CORNER_Y_THRESHOLD = 0.2  // y < 20% da altura
```

#### `usePresentationMode`

Gerencia o modo de apresentação (oculta UI desnecessária para demo). Carrega o estado salvo do `IStorageGateway` na montagem. Toggle ativado por long press de 2s no centro do globo.

---

## 16. Visualização 3D — Globe.gl + WebView

O globo 3D é renderizado por `globe.gl` (biblioteca WebGL baseada em Three.js) dentro de uma `WebView`. A comunicação entre React Native e o globo é bidirecional via `postMessage` / `onMessage`.

**Por que WebView e não Three.js nativo?**  
`globe.gl` é uma biblioteca JavaScript pura para browser. Portá-la para Three.js nativo + Expo GL aumentaria enormemente a complexidade sem benefício prático para o contexto do projeto. A WebView isola todo o contexto WebGL sem afetar o thread de animação do React Native.

**Arquitetura da comunicação:**

```
React Native (GlobeGlAdapter)
    ↓  webViewRef.postMessage(JSON.stringify(msg))
WebView (globe.html)
    ↓  window.addEventListener('message', handler)
    ↓  executa comando no globe.gl (pontos, arcos, dim, beacon)
    ↓  window.ReactNativeWebView.postMessage(JSON.stringify(event))
React Native (GlobeView.onMessage)
    ↓  onSatelliteTapped(noradId)
```

**Eventos recebidos do globo:**

| Evento | Payload | Efeito |
|--------|---------|--------|
| `GLOBE_READY` | — | Chama `onReady(adapter)` → libera controle do globo |
| `SATELLITE_TAPPED` | `{ noradId }` | Abre satellite control sheet |
| `SAT_CARD_CLOSE` | — | Fecha card do satélite |
| `SAT_CARD_OPEN_SHEET` | `{ noradId }` | Abre bottom sheet de controle |

---

## 17. Propagação Orbital — SGP4 via satellite.js

A posição de cada satélite é calculada em runtime com o algoritmo **SGP4**, o padrão da indústria espacial desde 1980. O `SatelliteJsAdapter` encapsula toda a interação com `satellite.js`:

```
TLEData (line1, line2)
  ↓  satellite.twoline2satrec(line1, line2)  → SatRec
  ↓  satellite.propagate(satrec, date)       → { position: EciVec3, velocity: EciVec3 }
  ↓  satellite.eciToGeodetic(eci, gmst)      → GeodeticVec3
  ↓  OrbitPosition { noradId, lat(°), lng(°), alt(km) }
```

**Por que `satellite.js` está no `transformIgnorePatterns` do Jest?**

`satellite.js` é distribuído como CommonJS não-transformado, o que causaria erro no ambiente ESM do `jest-expo`. A configuração do Jest inclui `satellite\\.js` na whitelist do `transformIgnorePatterns` para que o Babel o transforme corretamente durante os testes.

---

## 18. Animações — Reanimated 4

O projeto usa **React Native Reanimated 4** com worklets e shared values. Todas as animações rodam no thread de UI, sem bloquear o JS thread.

**Onde animações são usadas:**

| Componente | Animação | Técnica Reanimated 4 |
|---|---|---|
| `AlertCard` | Entrada/saída com spring | `useSharedValue` + `withSpring` |
| `OnboardingScreen` | Transição horizontal entre slides | `useSharedValue` + `withSpring` |
| `OnboardingScreen` | Star field (estrelas pulsando) | `withRepeat(withSequence(...))` |
| `OnboardingScreen` | Emoji pulsante (breathe) | `withRepeat(withSequence(withSpring, withSpring))` |
| `OnboardingScreen` | Dots indicadores | `useAnimatedStyle` com interpolação de opacidade/escala |
| `ModeToggle` | Slide do thumb | `useSharedValue` + `withTiming` |
| `MiniAlertBanner` | Fade in/out | `useSharedValue` + `withTiming` |

**Configuração de spring do AlertCard** (valores calibrados para eliminar bounce excessivo):
- `damping: 46`
- `stiffness: 200`
- `mass: 1`

---

## 19. Persistência Local — SQLite e MMKV

O projeto tem dois mecanismos de storage, consolidados em SQLite:

### SQLite (expo-sqlite)

Usado para:
- Tabela `orbital_alerts` — histórico de alertas acknowledged/dismissed
- Tabela `kv_store` — flags e preferências (substitui MMKV)

`SqliteService` gerencia o ciclo de vida da conexão e executa migrations versionadas. É injetado via DI nos repositórios que precisam dele.

### Por que SQLite em vez de MMKV para KV?

MMKV (`react-native-mmkv`) usa módulos nativos (NitroModules) que são **incompatíveis com o ambiente web do Expo Router** (`expo start --web`). Ao rodar no browser, o construtor da MMKV falha com "undefined cannot be used as a constructor". A decisão foi consolidar todo storage em SQLite, usando a tabela `kv_store` como KV store — funciona em todos os ambientes (iOS, Android, web).

### Chaves KV persistidas

| Chave | Valor | Descrição |
|-------|-------|-----------|
| `onboarding_completed` | `'true'` | Flag de conclusão do onboarding |
| `presentation_mode` | `'true'/'false'` | Estado do presentation mode |
| `simple_mode` | `'true'/'false'` | Toggle simples/técnico |
| `locale` | `'en'/'pt'` | Locale selecionado |

---

## 20. i18n — Internacionalização

O app suporta **EN (inglês)** e **PT-BR (português)**.

`translations.ts` exporta um objeto com todas as strings em ambos os idiomas. `useTranslation()` lê o `locale` da `useUIStore` e retorna as strings corretas. O locale persiste via `useUIStore` (que persiste no SQLite KV).

**Strings cobertas:**
- Todas as telas do onboarding (título, subtítulo, feature cards, CTAs)
- Labels da Alert Detail em modo técnico e simples
- Badges de severidade (CRITICAL / WARNING / INFO)
- Recomendações de manobra
- Labels do conjunction list e histórico

---

## 21. Push Notifications

Implementado via `expo-notifications`, wrappeado em `ExpoNotificationGateway` (implementa `INotificationGateway`).

**Quando é disparado:** toda vez que `spawnRandomConjunction` cria um novo `ConjunctionEvent`, o `GlobeScreen` chama `notificationGateway.scheduleLocal()`.

**Conteúdo da notificação:**
- Título: `"⚠️ Conjunction Alert — {SEVERITY}"`
- Corpo: `"{objectA.name} × {objectB.name} — {pc}"`
- Trigger: delay de 1 segundo

**Configuração em `app.json`:**
- iOS: `iosDisplayInForeground: true` (notificações aparecem mesmo com o app aberto)
- Permissão solicitada silenciosamente na montagem do `GlobeScreen`

---

## 22. Location Beacon

Implementado via `expo-location`, wrappeado em `ExpoLocationGateway`.

Quando `locationEnabled` está ativo na `useUIStore`, o `GlobeScreen`:
1. Chama `locationGateway.requestPermission()`
2. Se concedida: `locationGateway.getCurrentPosition()` → `{ lat, lng }`
3. Envia `globeAdapter.showUserBeacon(lat, lng)` → ponto ciano pulsante ("USER_BEACON") aparece no globo na posição do usuário

**Permissões declaradas em `app.json`:**
- iOS: `NSLocationWhenInUseUsageDescription`
- Android: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`

---

## 23. Haptics

`ExpoHapticsGateway` implementa `IHapticsGateway` usando `expo-haptics`.

| Evento | Tipo de haptic | Momento |
|--------|----------------|---------|
| Abrir Alert Detail | `impact('heavy')` | Na montagem do modal |
| Spawnar CRITICAL | `notification('error')` | Quando `spawnRandomConjunction` retorna CRITICAL |
| Spawnar WARNING | `notification('warning')` | Quando `spawnRandomConjunction` retorna WARNING |
| Tocar num satélite | `impact('light')` | `onSatelliteTapped` no GlobeScreen |

---

## 24. Tech Stack Completa

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Plataforma | Expo SDK | `~56.0.8` |
| Runtime | React Native | `0.85.3` |
| UI Framework | React | `19.2.3` |
| Linguagem | TypeScript | `~6.0.3` |
| Navegação | Expo Router | `~56.2.8` |
| Globo 3D | globe.gl (CDN, no WebView) | latest |
| Orbital Math | satellite.js | `^4.1.4` |
| Estado global | Zustand | `^5.0.14` |
| Animações | React Native Reanimated | `4.3.1` |
| Worklets | React Native Worklets | `0.8.3` |
| Gestos | React Native Gesture Handler | `~2.31.1` |
| Blur / Glass | expo-blur + expo-glass-effect | `~56.0.x` |
| Storage SQL | expo-sqlite | `~56.0.4` |
| Push Notifications | expo-notifications | `~56.0.16` |
| Localização | expo-location | `~56.0.16` |
| Haptics | expo-haptics | `~56.0.3` |
| Validação | Zod | `^4.4.3` |
| WebView | react-native-webview | `13.16.1` |
| Testes (runner) | jest-expo | `^56.0.4` |
| Testes (RTL) | @testing-library/react-native | `^13.3.3` |
| React Compiler | habilitado via `experiments.reactCompiler: true` | — |

**TypeScript** configurado em modo estrito: `strict: true`, `strictNullChecks: true`, `noUncheckedIndexedAccess: true`.

---

## 25. Dependências

### Produção

```json
{
  "@expo/ui": "~56.0.15",
  "expo": "~56.0.8",
  "expo-blur": "~56.0.3",
  "expo-constants": "~56.0.16",
  "expo-device": "~56.0.4",
  "expo-font": "~56.0.5",
  "expo-glass-effect": "~56.0.4",
  "expo-haptics": "~56.0.3",
  "expo-image": "~56.0.9",
  "expo-linking": "~56.0.13",
  "expo-location": "~56.0.16",
  "expo-notifications": "~56.0.16",
  "expo-router": "~56.2.8",
  "expo-splash-screen": "~56.0.10",
  "expo-sqlite": "~56.0.4",
  "expo-status-bar": "~56.0.4",
  "expo-symbols": "~56.0.5",
  "expo-system-ui": "~56.0.5",
  "expo-web-browser": "~56.0.5",
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "react-native": "0.85.3",
  "react-native-gesture-handler": "~2.31.1",
  "react-native-mmkv": "^4.3.1",
  "react-native-nitro-modules": "^0.35.9",
  "react-native-reanimated": "4.3.1",
  "react-native-safe-area-context": "~5.7.0",
  "react-native-screens": "4.25.2",
  "react-native-web": "~0.21.0",
  "react-native-webview": "13.16.1",
  "react-native-worklets": "0.8.3",
  "satellite.js": "^4.1.4",
  "zod": "^4.4.3",
  "zustand": "^5.0.14"
}
```

### Desenvolvimento

```json
{
  "@react-native/jest-preset": "^0.85.3",
  "@testing-library/react-native": "^13.3.3",
  "@types/jest": "^30.0.0",
  "@types/react": "~19.2.2",
  "jest": "^29.7.0",
  "jest-expo": "^56.0.4",
  "typescript": "~6.0.3"
}
```

---

## 26. Como Rodar o Projeto

### Pré-requisitos

- **Node.js** 20+
- **npm** 10+
- Para iOS: **Xcode 15+** e simulador iOS
- Para Android: **Android Studio** com emulador ou dispositivo físico

### Instalação

```bash
# Clone o repositório
git clone <url-do-repo>
cd gs

# Instale as dependências
npm install
```

### Execução

```bash
# Servidor de desenvolvimento (abre QR code para Expo Go / dev build)
npm start

# iOS
npm run ios

# Android
npm run android

# Web (funcionalidade limitada — globe.gl não funciona sem WebView nativa)
npm run web
```

### Notas importantes

**New Architecture:** Reanimated 4 e NitroModules (usado pelo MMKV) exigem New Architecture. Já habilitada via `experiments.reactCompiler: true` no `app.json` do Expo 56.

**Globe.gl:** carregado via CDN no `globe.html`. A visualização 3D **não funciona na web** (Expo web renderiza via DOM, não via WebView nativa). Use simulador ou dispositivo físico.

**MMKV:** instalado mas não usado como storage principal. O `SqliteKvStorageGateway` é o gateway ativo. MMKV é incompatível com web/SSR do Expo Router.

**Orientação:** bloqueada em portrait (`"orientation": "portrait"` no `app.json`).

---

## 27. Testes

### 27.1 Configuração

```bash
# Executar todos os testes
npm test

# Executar com cobertura
npm run test:coverage

# Executar um arquivo específico
npx jest src/core/entities/orbital-alert.test.ts

# Watch mode
npx jest --watch
```

**`jest.config.js`:**

```javascript
module.exports = {
  preset: 'jest-expo',
  coverageThreshold: {
    global: { lines: 90, functions: 90, branches: 90 },
  },
  coveragePathIgnorePatterns: [
    'src/application/container/',      // wiring puro
    'src/application/config/',         // config pura
    'src/core/repositories/i-*.ts',    // interfaces puras
    'src/core/gateways/i-*.ts',        // interfaces puras
    '.*-external-types\\.ts',          // tipos externos isolados
    '/index\\.ts$',                    // re-exports
  ],
  transformIgnorePatterns: [
    // satellite.js é CJS — precisa ser transformado pelo Babel
    'node_modules/(?!(...|satellite\\.js))',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^satellite\\.js$': '<rootDir>/node_modules/satellite.js/lib/index.js',
  },
}
```

### 27.2 Metas de Cobertura

| Camada | Meta | Justificativa |
|--------|------|---------------|
| `core/value-objects` | 100% | Invariantes críticos de domínio |
| `core/entities` | 100% | Comportamento central do sistema |
| `core/usecases` | 100% | Lógica de negócio pura |
| `infrastructure/adapters` | ≥ 90% | Anti-corruption layer |
| `infrastructure/repositories` | ≥ 90% | Repositórios mock |
| `infrastructure/persistence` | ≥ 90% | SQLite real |
| `application/stores` | ≥ 90% | Orquestração de estado |
| `presentation/hooks` | ≥ 90% | Hooks com lógica testável |
| `shared/utils` | 100% | Formatação pura |
| `application/config` | isento | Config pura, sem lógica |
| `application/container` | isento | Wiring puro, sem lógica |
| interfaces puras (`i-*.ts`) | isento | Sem implementação |
| componentes visuais | isento | Cobertos por testes de integração |

### 27.3 Casos de Teste Documentados

#### `NoradId`
- `create(44713)` → cria com valor correto
- `create(0)` → lança erro (deve ser positivo)
- `create(-1)` → lança erro
- `create(1.5)` → lança erro (deve ser inteiro)
- `equals(same)` → `true`
- `equals(different)` → `false`

#### `TLEData`
- `create(line1, line2)` com 69 chars cada → cria com sucesso
- `create(linhaInvalida, ...)` → lança erro de formato
- `isExpired()` com epoch recente → `false`
- `isExpired()` com epoch > 14 dias → `true`

#### `ProbabilityOfCollision`
- `create(1.4e-3)` → cria com sucesso
- `create(-0.1)` → lança erro (abaixo de 0)
- `create(1.1)` → lança erro (acima de 1)
- `exceedsThreshold()` com `5e-4` → `true` (> 1e-4)
- `exceedsThreshold()` com `5e-6` → `false`
- `toSeverity()` com `5e-4` → `'CRITICAL'`
- `toSeverity()` com `5e-5` → `'WARNING'`
- `toSeverity()` com `5e-6` → `'INFO'`
- `toScientificNotation()` com `1.4e-3` → `'1.4 × 10⁻³'`

#### `MissDistance`
- `create(847)` → cria com sucesso
- `create(-1)` → lança erro
- `isCritical()` com `999` → `true` (< 1000m)
- `isCritical()` com `1001` → `false`
- `isDangerous()` com `4999` → `true`
- `isDangerous()` com `5001` → `false`
- `toDisplayString()` com `847` → `'847m'`
- `toDisplayString()` com `12400` → `'12.4km'`

#### `TimeToClosestApproach`
- `create(futureDate)` → cria com sucesso
- `actionWindowIsOpen()` com data futura → `true`
- `actionWindowIsOpen()` com data passada → `false`
- `toDisplayString()` → formata como `'Xh Ymin'`
- `toUtcString()` → formata como `'HH:MM UTC'`

#### `SatelliteObject`
- `create({ name: 'ISS', ... })` → cria com sucesso
- `create({ name: '', ... })` → lança erro de nome vazio
- `create({ name: '   ', ... })` → lança erro (whitespace only)
- `isControllable()` com `OPERATIONAL_SATELLITE` → `true`
- `isControllable()` com `DEBRIS` → `false`
- `isControllable()` com `ASTEROID` → `false`
- `isControllable()` com `ROCKET_BODY` → `false`

#### `ConjunctionEvent`
- `create(params)` com Pc alto → severity `'CRITICAL'`
- `create(params)` com Pc médio → severity `'WARNING'`
- `create(params)` com Pc baixo → severity `'INFO'`
- `create(params)` com `missDistance < 1000m` → severity `'CRITICAL'` independente do Pc
- `isActive()` com TCPA futuro → `true`
- `isActive()` com TCPA passado → `false`

#### `OrbitalAlert`
- `create(event)` → status `'detected'`, `detectedAt` ≈ `Date.now()`
- `acknowledge()` → nova instância com status `'acknowledged'`
- `acknowledge()` não muta instância original → status original ainda `'detected'`
- `acknowledge()` retorna referência diferente (imutabilidade)
- `dismiss()` → nova instância com status `'dismissed'`
- `dismiss()` não muta instância original

#### `PropagateOrbits`
- Chama `adapter.propagate()` para cada satélite na lista
- Filtra posições `null` retornadas pelo adapter
- Retorna `[]` quando todos os adapters retornam `null`
- Retorna `OrbitPosition[]` com `noradId`, `lat`, `lng`, `alt` corretos
- Retorna `[]` e não chama adapter quando lista de satélites é vazia

#### `DetectConjunctions`
- Retorna `[]` quando há menos de 2 posições
- Cria `ConjunctionEvent` para pares com distância < 50km
- Ignora pares com distância ≥ 50km
- Ordena resultados por severidade (CRITICAL primeiro)
- Ignora posições sem satélite correspondente no mapa

#### `ClassifyRisk`
- `MissDistance < 1000m` → severity `'CRITICAL'` independente do Pc
- `MissDistance ≥ 1000m` com Pc alto → `'CRITICAL'`
- `MissDistance ≥ 1000m` com Pc médio → `'WARNING'`
- `MissDistance ≥ 1000m` com Pc baixo → `'INFO'`

#### `AcknowledgeAlert`
- Chama `alert.acknowledge()` → retorna alerta com status `'acknowledged'`
- Chama `IAlertHistoryRepository.save()` com o alerta acknowledged
- Chama `IStorageGateway.set()` para persistir flag
- Não chama repositório se `activeAlert` é `null`

#### `MockSatelliteRepository`
- `findAll()` → retorna `SatelliteObject[]` com todos os TLEs do `tles.json`
- Cada objeto tem `noradId`, `name`, `type`, `tleData` válidos

#### `MockConjunctionRepository`
- `findAll()` → retorna lista pré-definida de `ConjunctionEvent`s
- `findBySeverity('CRITICAL')` → filtra apenas os CRITICAL

#### `SqliteAlertHistoryRepository`
- `save(alert)` → persiste no SQLite
- `findAll()` → retorna alertas reconstituídos do banco
- `findByStatus('acknowledged')` → filtra por status
- Serialização/deserialização preserva todos os campos da entidade

#### `useOrbitalLoop`
- Executa callback a cada `intervalMs`
- Para de executar após unmount (cleanup do interval)
- Não executa callback durante unmount

#### `useHiddenTrigger`
- 5 taps no canto superior direito dentro de 1500ms → dispara `onTrigger`
- Tap fora do canto → reseta contador para zero
- 4 taps no canto, 1 fora → não dispara (contador resetado)
- Taps antigos (fora da janela de tempo) são descartados da contagem

#### `usePresentationMode`
- Carrega estado salvo do storage na montagem
- Toggle muda o estado e persiste via `IStorageGateway`

#### `formatters`
- `formatPc(1.4e-3)` → `'1.4 × 10⁻³'`
- `formatDistance(847)` → `'847m'`
- `formatDistance(12400)` → `'12.4km'`
- `formatTcpa(futureDate)` → `'Xh Ymin'`

---

## 28. Convenções de Nomenclatura

| Contexto | Convenção | Exemplos |
|---|---|---|
| Arquivos e pastas | `kebab-case` | `satellite-object.ts`, `use-orbital-store.ts` |
| Classes, interfaces, tipos, enums | `PascalCase` | `SatelliteObject`, `ITleGateway`, `AlertStatus` |
| Funções, variáveis, props | `camelCase` | `propagateOrbits()`, `activeAlert`, `onTrigger` |
| Constantes globais | `SCREAMING_SNAKE_CASE` | `MAX_CONJUNCTION_DISTANCE_KM`, `EARTH_RADIUS_KM` |
| Arquivos de teste | `<nome>.test.ts` ao lado do arquivo | `orbital-alert.test.ts` |

**Regra absoluta:** nenhum arquivo TypeScript/TSX usa PascalCase ou camelCase no nome. Isso inclui componentes React — `globe-view.tsx`, não `GlobeView.tsx`.

---

## 29. Linguagem Ubíqua

O projeto mantém linguagem ubíqua rigorosa. Usar os termos errados é um bug de nomenclatura.

| Termo canônico | Termos proibidos |
|---|---|
| `ConjunctionEvent` | "aproximação", "near miss", "colisão iminente" |
| `ProbabilityOfCollision` / `Pc` | "chance de colisão", "risco percentual" |
| `MissDistance` | "distância de passagem", "separação" |
| `TimeToClosestApproach` / `TCPA` | "countdown", "time to impact" |
| `SatelliteObject` | "objeto espacial", "item", "entidade orbital" |
| `NoradId` | "id", "objectId", "catalogNumber" |
| `OrbitalAlert` | "notification", "aviso" |
| `AlertHistory` | "log de alertas", "histórico de eventos" |
| `HiddenTrigger` | "easter egg", "trigger manual" |
| `TLEData` | "dados orbitais", "tle string" |
| `OrbitPosition` | "coordenadas", "localização" |
| `Severity` | "level", "prioridade" |
| `SGP4` | "algoritmo orbital", "propagador" |
| `ConjunctionDetection` | "detecção de colisão", "proximity check" |
| `OrbitalPropagation` | "cálculo de posição", "simulação orbital" |
| `StaticFactory` | "factory method", "construtor" |
| `AntiCorruptionLayer` | "adapter genérico", "wrapper" |

---

*Orbital Guardian Mobile — FIAP Global Solution 2026*
