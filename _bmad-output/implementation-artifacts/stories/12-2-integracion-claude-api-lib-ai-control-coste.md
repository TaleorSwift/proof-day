# Story 12.2 — Integración Claude API: lib/ai + control de coste

## Metadata
- **Epic:** 12 — AI Summaries & Notifications
- **Story key:** 12.2
- **Phase:** ready-for-dev
- **Agent:** Homer
- **Flow:** Full Flow (Homer)
- **Prerrequisito:** Story 12.1 Done

## User Story

Como desarrollador,
quiero disponer de una capa `lib/ai/` con el cliente de Claude y las funciones de síntesis, tracking de costes y verificación de presupuesto,
para que el webhook de síntesis automática (Story 12.3) pueda llamar a la API de Claude con control de gasto diario.

## Acceptance Criteria

**AC1 — Cliente Anthropic singleton**
Given que importo `lib/ai/claudeClient.ts`
When lo uso en varios módulos
Then obtengo siempre la misma instancia de `Anthropic` (singleton)
And usa la variable de entorno `ANTHROPIC_API_KEY`
And el modelo por defecto es `claude-sonnet-4-6`

**AC2 — Función synthesizeFeedbacks**
Given que llamo a `synthesizeFeedbacks(feedbacks, project)`
When la llamada a Claude tiene éxito
Then retorna un objeto `AISynthesisResult` con:
  - `summaryText: string` — resumen ejecutivo (2-3 frases)
  - `keyInsights: string[]` — array con puntos clave (puntos fuertes + áreas de mejora + recomendación)
  - `model: string` — nombre del modelo usado (`claude-sonnet-4-6`)
  - `tokensInput: number` — tokens de entrada consumidos
  - `tokensOutput: number` — tokens de salida consumidos
  - `costUsd: number` — coste estimado en USD
And el prompt enviado a Claude contiene el título del proyecto y los textos de los feedbacks

**AC3 — Prompt de síntesis**
Given que se construye el prompt para Claude
When se genera para un proyecto con N feedbacks
Then el prompt incluye:
  - "Sintetiza los siguientes feedbacks sobre el proyecto [título del proyecto]"
  - Instrucción de formato: 1) Resumen ejecutivo (2-3 frases) 2) Puntos fuertes (bullet list) 3) Áreas de mejora (bullet list) 4) Recomendación final
  - Los textos de respuesta de cada feedback (de `text_responses`)

**AC4 — Función checkDailyBudget**
Given que llamo a `checkDailyBudget(communityId)`
When el coste acumulado hoy en `ai_cost_tracking` es menor que `AI_DAILY_BUDGET_USD`
Then retorna `true` (presupuesto disponible)
When el coste acumulado hoy en `ai_cost_tracking` es mayor o igual a `AI_DAILY_BUDGET_USD`
Then retorna `false` (presupuesto excedido)
And `AI_DAILY_BUDGET_USD` tiene como valor por defecto `5.0` si la variable de entorno no está definida

**AC5 — Función trackCost**
Given que llamo a `trackCost(input)`
When la fila del mes actual existe en `ai_cost_tracking`
Then hace un UPDATE sumando los nuevos tokens y coste al acumulado existente
And actualiza `synthesis_count` incrementándolo en 1
And actualiza `updated_at` a now()
When la fila del mes actual NO existe en `ai_cost_tracking`
Then hace un INSERT con los valores iniciales
And el campo `month` tiene formato `YYYY-MM` (ej: `2026-05`)

**AC6 — Variables de entorno documentadas**
Given que reviso `.env.example`
When busco las variables necesarias para Epic 12
Then encuentro `ANTHROPIC_API_KEY` con comentario de dónde obtenerla
And encuentro `AI_DAILY_BUDGET_USD` con su valor por defecto (5.0) documentado

**AC7 — Barrel export**
Given que importo desde `lib/ai`
When uso `import { synthesizeFeedbacks, checkDailyBudget, trackCost } from '@/lib/ai'`
Then todas las funciones están disponibles sin imports directos a submódulos

**AC8 — Tests unitarios**
Given que ejecuto `npm run test:unit`
When se procesan los tests de `tests/unit/ai/`
Then todos los tests de `lib/ai/` pasan al 100%
And los tests usan mocks del SDK de Anthropic (sin llamadas reales a la API)
And hay cobertura para: síntesis exitosa, error de red, presupuesto bajo límite, presupuesto en límite, presupuesto excedido, trackCost insert primera vez, trackCost update acumulado

## Tasks

- [ ] Task 1: Crear `lib/ai/claudeClient.ts` — singleton Anthropic con `claude-sonnet-4-6` y `ANTHROPIC_API_KEY`
- [ ] Task 2: Crear `lib/ai/synthesizeFeedbacks.ts` — función que construye prompt y llama al cliente. Retorna `AISynthesisResult` con summaryText, keyInsights, model, tokensInput, tokensOutput, costUsd
- [ ] Task 3: Crear `lib/ai/costTracker.ts` — función `trackCost(input: TrackCostInput): Promise<void>` con read-modify-write en `ai_cost_tracking` (no RPC)
- [ ] Task 4: Crear `lib/ai/budgetChecker.ts` — función `checkDailyBudget(communityId: string): Promise<boolean>` que suma `estimated_cost_usd` del día actual
- [ ] Task 5: Crear `lib/ai/index.ts` — barrel export de todas las funciones y tipos
- [ ] Task 6: Añadir `ANTHROPIC_API_KEY` y `AI_DAILY_BUDGET_USD` a `.env.example`
- [ ] Task 7: Crear `tests/unit/ai/claudeClient.test.ts`
- [ ] Task 8: Crear `tests/unit/ai/synthesizeFeedbacks.test.ts`
- [ ] Task 9: Crear `tests/unit/ai/costTracker.test.ts`
- [ ] Task 10: Crear `tests/unit/ai/budgetChecker.test.ts`
- [ ] Task 11: Verificar que todos los tests pasan

## Dev Notes

### Ficheros a crear
- `lib/ai/claudeClient.ts`
- `lib/ai/synthesizeFeedbacks.ts`
- `lib/ai/costTracker.ts`
- `lib/ai/budgetChecker.ts`
- `lib/ai/index.ts`
- `tests/unit/ai/claudeClient.test.ts`
- `tests/unit/ai/synthesizeFeedbacks.test.ts`
- `tests/unit/ai/costTracker.test.ts`
- `tests/unit/ai/budgetChecker.test.ts`

### Ficheros a modificar
- `.env.example` — añadir `ANTHROPIC_API_KEY` y `AI_DAILY_BUDGET_USD`

### Tipos de referencia (`lib/types/ai.ts`)
- `AICostTracking` / `AICostTrackingRow` — usados en `trackCost` y `checkDailyBudget`
- `aiCostTrackingFromRow()` — mapper disponible para deserializar rows de Supabase
- `AISummary` — el resultado de síntesis se almacenará en esta tabla (lo hace Story 12.3)

### Tipo nuevo a definir en este módulo
```typescript
// lib/ai/synthesizeFeedbacks.ts (o lib/ai/types.ts)
export interface AISynthesisResult {
  summaryText: string
  keyInsights: string[]
  model: string
  tokensInput: number
  tokensOutput: number
  costUsd: number
}

export interface TrackCostInput {
  tokensInput: number
  tokensOutput: number
  costUsd: number
}
```

### Schema de ai_cost_tracking (migración 030)
- `month` — varchar(7), UNIQUE, formato `YYYY-MM`
- `tokens_input` / `tokens_output` — bigint, acumulado mensual
- `estimated_cost_usd` — numeric(10,6), viene como string desde PostgreSQL (usar parseFloat)
- `synthesis_count` — int, incrementar en 1 por llamada

### trackCost — patrón read-modify-write
`trackCost` NO usa RPC. El patrón es:
1. SELECT la fila del mes actual (`YYYY-MM`)
2. Si existe: UPDATE sumando los deltas (tokens + coste) e incrementando synthesis_count
3. Si no existe: INSERT con los valores iniciales
Usar service role client de Supabase (ver Story 12.3 para el patrón de importación).

### checkDailyBudget — nota sobre granularidad
La tabla `ai_cost_tracking` acumula por mes, no por día. Para checkDailyBudget, la implementación debe decidir si comparar el total mensual (aproximación) o añadir una columna de coste diario. Decisión recomendada: comparar el coste mensual dividido entre los días transcurridos del mes actual como proxy del gasto diario. Si no se desea esa complejidad, comparar el total mensual contra `AI_DAILY_BUDGET_USD * 30` como límite mensual. **Documentar la decisión tomada en el Dev Agent Record.**

### Patrones del proyecto
- No usar Tailwind directamente en funciones de dominio — este módulo es pura lógica de servidor
- TDD Outside-In: escribir el test antes que la implementación
- Hexagonal: `lib/ai/` es la capa de infraestructura (adaptador hacia Claude API). El servicio de síntesis orquesta desde fuera.
- No hardcodear el model string — exportar `AI_MODEL = 'claude-sonnet-4-6'` como constante

### Coste estimado Claude claude-sonnet-4-6 (referencia para tests)
- Input: ~$3 / MTok
- Output: ~$15 / MTok
- Fórmula: `costUsd = (tokensInput * 3 + tokensOutput * 15) / 1_000_000`
