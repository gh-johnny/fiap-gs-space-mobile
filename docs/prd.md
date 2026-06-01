# PRD — Orbital Guardian Mobile
**Versão:** 1.0 | **Data:** 2026-06-01 | **Contexto:** FIAP Global Solution 2026

---

## Visão geral

App mobile companion do ecossistema Orbital Guardian. Funciona como visualizador imersivo de risco orbital — o usuário vê satélites reais em órbita e recebe alertas de conjunção no estilo operador. Tudo mockado, sem backend.

A narrativa do spinoff: a mesma engine de risco que nasceu para resolver o problema mais difícil do mundo (colisão orbital a 28.000 km/h) é a prova de conceito de uma plataforma que pode ser aplicada em qualquer domínio de tráfego terrestre.

---

## Personas

| Persona | Papel no app |
|---|---|
| Cidadão/observador | Experiência principal — explora o globo, entende o risco orbital |
| Operador (embutido) | Recebe e lê alertas de conjunção com dados técnicos |

---

## Telas (3)

### 1. Onboarding — 1 slide
- Aparece somente no primeiro acesso
- Explica em uma frase o que é Orbital Guardian
- CTA: "Explorar órbita"
- Persiste flag de visualização no storage local

### 2. Globe View — tela principal
- Globo 3D com rotação automática elegante (fundo permanente em todas as telas)
- 20–50 satélites reais em órbitas calculadas via SGP4
- 2–3 detritos visualmente diferenciados (cor/forma)
- Linha de conjunção pulsando em vermelho entre 2 objetos em risco
- Card de alerta surge automaticamente após X segundos (ou via trigger oculto)
- Modo de apresentação: oculta UI desnecessária

### 3. Alert Detail — modal stack
- Abre ao tocar no card de alerta flutuante
- Conteúdo técnico-operacional:
  - Objetos envolvidos: `STARLINK-1234 × DEBRIS-7821`
  - Probabilidade de Colisão: `1.4 × 10⁻³ ⚠️`
  - Miss Distance: `847m`
  - Time to Closest Approach: `4h 23min`
  - Recomendação: `"Manobra evasiva recomendada"`
  - Janela de ação: `até 14:37 UTC`
- Card glassmorphism dark sobre o globo ao fundo

### 4. Conjunction List — bottom sheet
- Desliza de baixo, globo continua visível ao fundo
- Fila priorizada de conjunções mockadas
- Ordenada por severidade (Critical → Warning → Info)
- Cada item abre o Alert Detail

---

## Fluxo da demo

```
App abre
  → [1º acesso] Onboarding slide → CTA → Globe View
  → [acessos seguintes] Globe View diretamente

Globe View
  → Rotação automática elegante
  → Satélites reais em órbita (SGP4)
  → [X segundos / 5 taps no canto superior direito]
  → Globo dim (overlay animado)
  → Card de alerta surge com vibração + som
  → Linha de conjunção pulsa em vermelho no globo

Toque no card → Alert Detail (modal)
Swipe down ou X → fecha modal → Globe View

Swipe up / botão de lista → Conjunction List (bottom sheet)
Toque em item → Alert Detail
```

---

## Identidade visual

- **Tema:** Glassmorphism dark
- **Base:** fundo preto/azul escuro, globo sempre presente como camada de fundo
- **Cards:** blur + transparência (expo-glass-effect + expo-blur)
- **Alertas críticos:** vermelho (`#FF3B30`)
- **Alertas de aviso:** laranja (`#FF9500`)
- **Satélites:** branco/azul neon (`#00D4FF`)
- **Detritos:** cinza/amarelo (`#FFD60A`)
- **Linha de conjunção:** vermelho pulsante

---

## Critério de done

- [ ] Onboarding de 1 slide com persistência de flag no storage
- [ ] Globo 3D animado com satélites reais (SGP4)
- [ ] Rotação automática elegante do globo
- [ ] Trigger oculto (5 taps canto superior direito)
- [ ] Alert card surge com animação Reanimated 4 worklet
- [ ] Vibração + som no alerta (expo-haptics)
- [ ] Globe dim sincronizado com o alerta
- [ ] Linha de conjunção pulsando no globo
- [ ] Alert Detail com dados técnicos mockados
- [ ] Conjunction List como bottom sheet
- [ ] Navegação entre todas as telas
- [ ] Animações de transição suaves
- [ ] Modo de apresentação (UI limpa)
- [ ] Ícones e tipografia refinados

---

## Fora do escopo

- Backend, banco de dados, IA
- Dados financeiros (exposição em USD) nas telas
- Domínio marítimo, drones, frota
- Autenticação e autorização
- Persona seguradora/regulador
- Sincronização com Space-Track.org em runtime
