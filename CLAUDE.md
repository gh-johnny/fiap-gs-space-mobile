@AGENTS.md

---

## Documentação do Projeto

| Documento | Caminho | Conteúdo |
|---|---|---|
| **PRD** | `docs/prd.md` | Personas, telas, fluxo de demo, critério de done, fora de escopo |
| **Arquitetura técnica** | `docs/technical.md` | Stack, camadas, estrutura de pastas, princípios, fluxo de dados |
| **Linguagem ubíqua** | `docs/ubiquitous-language.md` | Termos canônicos do domínio — use sempre estes termos no código |
| **TODO** | `.claude/TODO.md` | 27 fases de implementação com tasks atômicas rastreáveis |

> Antes de criar qualquer arquivo, consulte `docs/technical.md` para colocar na camada correta.
> Antes de nomear qualquer símbolo, consulte `docs/ubiquitous-language.md`.

---

## Convenção de nomenclatura

| Contexto | Convenção | Exemplo |
|---|---|---|
| **Arquivos e pastas** | `kebab-case` | `satellite-object.ts`, `use-orbital-store.ts` |
| **Classes, interfaces, tipos, enums** | `PascalCase` | `SatelliteObject`, `ITleGateway` |
| **Funções, variáveis, props** | `camelCase` | `propagateOrbits()`, `activeAlert` |
| **Constantes globais** | `SCREAMING_SNAKE_CASE` | `MAX_CONJUNCTION_DISTANCE_KM` |
| **Arquivos de teste** | `<nome>.test.ts` ao lado do arquivo | `satellite-object.test.ts` |

**Esta convenção é absoluta.** Nenhum arquivo TypeScript/TSX usa PascalCase no nome.

---

## Claude Code Skills

### Aplicar proativamente — sem esperar o usuário pedir

| Skill | Quando aplicar |
|---|---|
| `tdd` | **Sempre** — teste antes da implementação, sem exceção |
| `ddd` | Ao desenhar entidades, value objects, aggregates, use cases |
| `onion-architecture` | Ao criar qualquer arquivo — verificar camada correta antes de escrever |
| `typescript-advanced-types` | Branded types, discriminated unions, generics no domínio |
| `typescript-pro` | Interfaces, tipos utilitários, inferência avançada |
| `creating-reanimated-animations` | Qualquer animação, worklet, shared value ou transição |
| `react-hooks-complete` | Ao criar ou modificar qualquer custom hook |
| `zustand-state-management` | Qualquer store ou estado global na camada application |
| `zod-skill` | Qualquer schema, validação de env var ou contrato de dados |
| `native-data-fetching` | Padrões de carregamento — SQLite, MMKV, dados bundled |
| `react-performance` | Globe WebView, Reanimated worklets, otimização de re-renders |
| `composition-patterns` | Composição de componentes complexos (AlertCard, GlobeView) |
| `arch-testing` | Testes de camada — verificar que imports respeitam arquitetura |
| `arch-validator` | Validar fronteiras entre camadas antes de commitar |
| `react-testing` | Testes de hooks e componentes React Native |
| `impl-todos` | Ao iniciar implementação de qualquer feature do PRD |

### Situacionais — invocar quando o contexto pedir

| Skill | Quando invocar |
|---|---|
| `lottie` | Animação de onboarding ou loading state do globo |
| `imagegen-frontend-mobile` | Gerar assets visuais (ícone, splash screen) |
| `handoff` | Compactar sessão longa para próximo contexto |
| `react-native-skills` | Padrões gerais RN, StyleSheet, APIs nativas |
| `building-native-ui` | Bottom sheet, modal stack, Expo Router, NativeTabs |
| `ui-ux-pro-max` | Refinamento visual do glassmorphism dark |

---

## Princípios de desenvolvimento

### Arquitetura
- **Toda interface vive em `domain/`** — implementações em `infrastructure/`
- **Use cases nunca importam de `infrastructure/`** — só de `domain/`
- **Presentation nunca importa de `infrastructure/`** — só via hooks que usam stores
- **Container.ts é a única linha que muda** ao trocar Mock → Real

### Domínio
- **Static factories obrigatórias** — `private constructor` + `static create(params)` em todas as entidades e value objects. `new` só dentro do próprio arquivo de domínio
- **Sem primitivos soltos** — `Pc`, `MissDistance`, `TCPA`, `NoradId` são value objects
- **Comportamento, não dados** — value objects expõem métodos (`isDangerous()`), não getters passivos

### Anti-Corruption Layer
- **Tipos externos ficam em `infrastructure/`** — nunca no `domain/`
- Libs externas (`satellite.js`, `globe.gl`, `expo-sqlite`) têm tipos isolados em `*-external-types.ts`
- Adapters são a única fronteira: recebem tipo externo, retornam tipo interno

### Testes
- **Meta: ≥ 90% de cobertura** em todo código com lógica
- **TDD:** teste vermelho → implementação mínima → refactor
- **Teste ao lado do arquivo:** `satellite-object.ts` → `satellite-object.test.ts`
- **Isentos:** `env.ts`, `container.ts`, interfaces puras, componentes sem lógica
