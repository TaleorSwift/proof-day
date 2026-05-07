# Story 12.2 — Integración Ollama: lib/ai + control de coste

## Metadata
- **Epic:** 12 — AI Summaries & Notifications
- **Story key:** 12.2
- **Phase:** ready-for-dev
- **Agent:** Homer
- **Flow:** Full Flow (Homer)
- **Prerrequisito:** Story 12.1 Done

## User Story

Como desarrollador,
quiero disponer de una capa `lib/ai/` con el cliente de Ollama y las funciones de síntesis, tracking de uso y verificación de presupuesto,
para que el webhook de síntesis automática (Story 12.3) pueda llamar al modelo local con control de uso diario.

## Acceptance Criteria

**AC1 — Cliente Ollama singleton**
Given que importo `lib/ai/ollamaClient.ts`
When lo uso en varios módulos
Then obtengo siempre la misma instancia del cliente HTTP (singleton)
And usa `OLLAMA_BASE_URL` (default `http://localhost:11434`) y `OLLAMA_MODEL` (default `qwen2.5:3b`)

**AC2 — Función synthesizeFeedbacks**
Given que llamo a `synthesizeFeedbacks(feedbacks, project)`
When la llamada a Ollama tiene éxito
Then retorna un objeto `AISynthesisResult` con:
  - `summaryText: string` — resumen ejecutivo (2-3 frases)
  - `keyInsights: string[]` — array de puntos clave (puntos fuertes + áreas de mejora + recomendación)
  - `model: string` — nombre del modelo usado (de `OLLAMA_MODEL`)
  - `tokensInput: number` — tokens de entrada (de la respuesta de Ollama)
  - `tokensOutput: number` — tokens de salida
  - `costUsd: number` — siempre 0.0 (modelo local, sin coste)
And el prompt enviado contiene el título del proyecto y los textos de los feedbacks

**AC3 — Prompt de síntesis**
Given que se construye el prompt para Ollama
When se genera para un proyecto con N feedbacks
Then el prompt incluye:
  - "Sintetiza los siguientes feedbacks sobre el proyecto [título del proyecto]"
  - Instrucción de formato: 1) Resumen ejecutivo (2-3 frases) 2) Puntos fuertes (bullet list) 3) Áreas de mejora (bullet list) 4) Recomendación final
  - Los textos de respuesta de cada feedback (de `text_responses`)
  - Instrucción "Responde SOLO en español. Sé conciso."

**AC4 — Función checkDailyBudget**
Given que llamo a `checkDailyBudget(communityId)`
When el modelo es local (Ollama)
Then retorna siempre `true` (sin límite de presupuesto económico)
And `AI_DAILY_BUDGET_USD` se mantiene en config para compatibilidad futura

**AC5 — Función trackCost**
Given que llamo a `trackCost(input)`
When la fila del mes actual existe en `ai_cost_tracking`
Then hace un UPDATE sumando los nuevos tokens al acumulado
And actualiza `synthesis_count` incrementándolo en 1
And actualiza `updated_at` a now()
When la fila del mes actual NO existe en `ai_cost_tracking`
Then hace un INSERT con los valores iniciales
And `total_cost_usd` es siempre 0.0 para Ollama

**AC6 — Variables de entorno documentadas**
Given que existe `.env.example`
Then contiene `OLLAMA_BASE_URL=http://localhost:11434`
And contiene `OLLAMA_MODEL=qwen2.5:3b`
And contiene `AI_DAILY_BUDGET_USD=5.0`

## Tasks / Subtasks

- [ ] **T1** — Tests TDD (RED) para lib/ai/
  - [ ] T1.1 Test: `ollamaClient` retorna singleton (misma referencia en dos imports)
  - [ ] T1.2 Test: `synthesizeFeedbacks` construye el prompt correcto y parsea la respuesta
  - [ ] T1.3 Test: `synthesizeFeedbacks` maneja error de red (Ollama no disponible)
  - [ ] T1.4 Test: `checkDailyBudget` retorna true siempre para Ollama local
  - [ ] T1.5 Test: `trackCost` hace UPDATE si la fila del mes existe
  - [ ] T1.6 Test: `trackCost` hace INSERT si la fila del mes NO existe

- [ ] **T2** — Implementar `lib/ai/ollamaClient.ts`
  - [ ] T2.1 Singleton con `baseUrl` y `model` de env vars
  - [ ] T2.2 Método `generate(prompt: string): Promise<OllamaResponse>` — POST a `/api/generate`
  - [ ] T2.3 Type `OllamaResponse` con `response`, `eval_count`, `prompt_eval_count`

- [ ] **T3** — Implementar `lib/ai/synthesizeFeedbacks.ts`
  - [ ] T3.1 `buildPrompt(feedbacks, project)` — función pura, testable
  - [ ] T3.2 `synthesizeFeedbacks(feedbacks, project)` — llama al cliente, parsea respuesta
  - [ ] T3.3 `parseAIResponse(text)` — extrae summaryText y keyInsights del texto libre
  - [ ] T3.4 Type `AISynthesisResult`

- [ ] **T4** — Implementar `lib/ai/costTracker.ts`
  - [ ] T4.1 `trackCost(input: TrackCostInput)` con read-modify-write en `ai_cost_tracking`
  - [ ] T4.2 Usar service role client de Supabase (no cookie client)

- [ ] **T5** — Implementar `lib/ai/budgetChecker.ts`
  - [ ] T5.1 `checkDailyBudget(communityId)` — retorna true para Ollama local

- [ ] **T6** — `lib/ai/index.ts` barrel export

- [ ] **T7** — Lint, types y tests verdes
  - [ ] T7.1 `npm test --no-coverage` — suite completa verde
  - [ ] T7.2 `npx tsc --noEmit` — sin errores nuevos

## Dev Notes

### Arquitectura

**Ficheros a CREAR:**
- `lib/ai/ollamaClient.ts` — cliente HTTP singleton para Ollama
- `lib/ai/synthesizeFeedbacks.ts` — prompt builder + llamada al modelo
- `lib/ai/costTracker.ts` — tracking de uso en `ai_cost_tracking`
- `lib/ai/budgetChecker.ts` — verificación de presupuesto (siempre true para Ollama)
- `lib/ai/index.ts` — barrel export
- `tests/unit/ai/ollamaClient.test.ts`
- `tests/unit/ai/synthesizeFeedbacks.test.ts`
- `tests/unit/ai/costTracker.test.ts`
- `tests/unit/ai/budgetChecker.test.ts`

### Cliente Ollama

Ollama expone una API REST compatible. El endpoint de generación:
```
POST http://localhost:11434/api/generate
{
  "model": "qwen2.5:3b",
  "prompt": "...",
  "stream": false
}
```
Respuesta: `{ "response": "...", "eval_count": 150, "prompt_eval_count": 200 }`

No se usa SDK de Anthropic ni `openai` package — fetch nativo o `node-fetch`.

### Service Role Client para trackCost

`trackCost` necesita acceder a `ai_cost_tracking` que tiene RLS restrictiva. Usar:
```typescript
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### Tokens y coste

Para Ollama local, `costUsd = 0.0` siempre. Los tokens se registran igualmente en `ai_cost_tracking` para tener métricas de uso.

### Patrones del proyecto
- NO Tailwind, solo `var(--token-name)` para CSS
- TDD Outside-In: tests primero
- Mocks de fetch/HTTP en tests (no llamadas reales a Ollama)
