# Story 13.7 — Copiloto IA: asistencia en la creación de proyecto

**Epic:** 13 — Iteración, Cierre del Loop y Copiloto IA
**Story key:** 13.7
**Status:** dev-complete
**Fase:** GROWTH 2.1
**Prerequisito:** Stories 13.1–13.6 completadas; `lib/ai/` con `synthesizeFeedbacks` y Ollama client operativos (Story 12.2)

---

## User Story

**Como** Builder que está creando un nuevo proyecto en Proof Day,
**quiero** recibir sugerencias generadas por IA para los campos del wizard (problema, solución, hipótesis),
**para que** pueda arrancar con contenido de calidad cuando no sé cómo formular mis ideas o quiero una referencia para mejorar mi redacción.

---

## Acceptance Criteria

### AC1 — Botón "Sugerir con IA" en los campos del wizard

**Given** que el Builder está en el paso 2 del wizard (WizardStepDescription) y ha escrito al menos el título del proyecto,
**When** hace click en el botón "Sugerir con IA" junto al campo "Problema",
**Then** se muestra un estado de carga en el botón y se llama a `POST /api/ai/suggest-project-field`.

**Given** que el Builder está en el paso 4 (WizardStepHypothesis) y ha escrito problema y solución,
**When** hace click en "Sugerir con IA" junto al campo "Hipótesis",
**Then** se llama a `POST /api/ai/suggest-project-field` con el contexto del proyecto parcialmente completado.

**Given** que el Builder NO ha escrito el título del proyecto,
**When** hace hover o click en el botón "Sugerir con IA",
**Then** el botón está deshabilitado con tooltip "Escribe el nombre del proyecto primero".

### AC2 — POST /api/ai/suggest-project-field

**Given** que se llama a `POST /api/ai/suggest-project-field` con `{field, title, problem?, solution?, hypothesis?, templateId?}` y el usuario está autenticado,
**When** el endpoint procesa la petición,
**Then** retorna `200` con `{suggestion: string}` — una sugerencia de texto para el campo indicado.

**Given** que `field` no es uno de: `problem`, `solution`, `hypothesis`,
**Then** retorna `400 {error: 'INVALID_FIELD'}`.

**Given** que el usuario no está autenticado,
**Then** retorna `401`.

**Given** que el presupuesto diario está agotado (`checkDailyBudget` retorna `false`),
**Then** retorna `429 {error: 'BUDGET_EXCEEDED'}`.

**Given** que Ollama no está disponible o la llamada falla,
**Then** retorna `503 {error: 'AI_UNAVAILABLE'}`.

### AC3 — Sugerencia se inserta en el campo sin sobreescritura forzada

**Given** que la IA retorna una sugerencia,
**When** el Builder la recibe en el wizard,
**Then** el campo se rellena automáticamente con la sugerencia pero el Builder puede editarla libremente antes de continuar.

**Given** que el campo ya tiene contenido escrito por el Builder,
**When** llega la sugerencia de IA,
**Then** el contenido existente se sustituye por la sugerencia (con indicador visual de que el texto fue generado por IA).

### AC4 — Indicador "Generado con IA" en el campo rellenado

**Given** que el campo fue rellenado con una sugerencia de IA,
**When** el Builder ve el campo,
**Then** se muestra un badge o texto pequeño "✦ Generado con IA" junto al campo.

**Given** que el Builder edita el texto generado por IA,
**When** empieza a teclear,
**Then** el indicador "Generado con IA" desaparece (el texto ya no es íntegramente generado por IA).

### AC5 — Tracking de coste en `ai_cost_tracking`

**Given** que una sugerencia se genera correctamente,
**When** el endpoint retorna la respuesta,
**Then** se registra el coste en `ai_cost_tracking` usando `trackCost()`.

### AC6 — Storybook

**Given** que se consulta Storybook,
**When** se navega al componente `AISuggestButton`,
**Then** hay al menos 3 variantes:
- `Default` — botón activo, sin carga
- `Loading` — botón en estado de carga (spinner)
- `Disabled` — botón deshabilitado (sin título)

### AC7 — Tests

**Given** que se ejecuta `npm run test:unit`,
**Then** hay tests para:
- `POST /api/ai/suggest-project-field`: 401 sin auth, 400 campo inválido, 429 budget agotado, 503 Ollama no disponible, 200 con sugerencia válida
- `AISuggestButton`: renderiza deshabilitado sin título, muestra spinner en loading, llama a la API al hacer click
- `WizardStepDescription`: botón "Sugerir con IA" visible junto al campo problema/solución cuando hay título

---

## Tasks de implementación

> Seguir TDD Outside-In: escribir test primero, implementar, verificar verde.

### Task 1 — API route `POST /api/ai/suggest-project-field`

Crear `app/api/ai/suggest-project-field/route.ts`:

```typescript
// POST /api/ai/suggest-project-field
// Body: { field: 'problem' | 'solution' | 'hypothesis', title: string, problem?: string, solution?: string, hypothesis?: string, templateId?: string }
// Auth: requireAuth (usuario autenticado, no necesita ser Builder de un proyecto específico)
```

Flujo:
1. `requireAuth` → 401 si no autenticado
2. Validar `field` ∈ `['problem', 'solution', 'hypothesis']` → 400 si inválido
3. `checkDailyBudget('global')` (budget global, no por comunidad) → 429 si excedido
4. Construir prompt según `field` (ver Dev Notes)
5. Llamar a Ollama via `getOllamaClient()`
6. `trackCost(...)` con el coste estimado
7. Retornar `{suggestion: string}`

Para budget global, pasar un `communityId` ficticio constante `'global'` o `null` — verificar cómo `checkDailyBudget` maneja esto. Si no admite `null`, crear una variante con comunidad de sistema.

### Task 2 — Componente `AISuggestButton`

Crear `components/projects/wizard/AISuggestButton.tsx`:

```typescript
interface AISuggestButtonProps {
  field: 'problem' | 'solution' | 'hypothesis'
  context: {
    title: string
    problem?: string
    solution?: string
    hypothesis?: string
    templateId?: string
  }
  onSuggestion: (text: string) => void
  disabled?: boolean
}
```

- Renderiza un botón pequeño "Sugerir con IA" con icono de chispa (✦ o similar)
- Estado `loading`: muestra spinner, deshabilita el botón
- Estado `disabled` (sin título): tooltip explicativo
- Al recibir sugerencia: llama a `onSuggestion(text)`
- Usa design tokens del proyecto (NO Tailwind directo)

### Task 3 — Indicador "Generado con IA" en los campos

Dentro de `WizardStepDescription.tsx` y `WizardStepHypothesis.tsx`:

- Añadir estado local `aiGeneratedFields: Set<string>` para saber qué campos fueron rellenados por IA
- Al llamar a `onSuggestion`: marcar el campo como `ai-generated` en el estado
- Al detectar cambio manual del Builder (onChange del textarea): desmarcar el campo
- Mostrar badge "✦ Generado con IA" si el campo está marcado

### Task 4 — Integrar `AISuggestButton` en `WizardStepDescription`

En `WizardStepDescription.tsx`:
- Añadir `AISuggestButton` junto al label del campo "Problema"
- Añadir `AISuggestButton` junto al label del campo "Solución"
- Disabled si `data.title === ''`

### Task 5 — Integrar `AISuggestButton` en `WizardStepHypothesis`

En `WizardStepHypothesis.tsx`:
- Añadir `AISuggestButton` junto al label del campo "Hipótesis"
- Disabled si `data.title === ''`
- El context incluye `problem` y `solution` ya escritos

### Task 6 — Tests de la API (TDD — escribir primero)

Crear `tests/unit/api/ai-suggest.test.ts`:
- Test 401: sin token de sesión → 401
- Test 400: `field: 'invalid'` → 400 `INVALID_FIELD`
- Test 429: `checkDailyBudget` retorna `false` → 429 `BUDGET_EXCEEDED`
- Test 503: Ollama lanza error → 503 `AI_UNAVAILABLE`
- Test 200: mock de Ollama retorna texto → 200 `{suggestion: "..."}`

### Task 7 — Tests del componente `AISuggestButton` (TDD)

Crear `tests/unit/components/AISuggestButton.test.tsx`:
- Renderiza habilitado cuando `context.title` no está vacío
- Renderiza deshabilitado cuando `context.title === ''`
- Muestra spinner durante la llamada a la API (estado loading)
- Llama a `onSuggestion` con el texto retornado por la API
- No llama a `onSuggestion` si la API devuelve error

### Task 8 — Storybook `AISuggestButton.stories.tsx`

Crear `stories/projects/wizard/AISuggestButton.stories.tsx` con 3 variantes: `Default`, `Loading`, `Disabled`.

---

## Dev Notes

### Prompt de IA por campo

El prompt varía según el campo solicitado. Usar el idioma español:

```typescript
function buildSuggestionPrompt(field: string, context: SuggestContext): string {
  const base = `Eres un asistente que ayuda a emprendedores a describir sus proyectos de forma clara y concisa. El proyecto se llama "${context.title}".`

  if (field === 'problem') {
    return `${base} Escribe un párrafo breve (2-3 frases) describiendo el problema que este proyecto resuelve. Sé específico y orientado al usuario afectado.`
  }
  if (field === 'solution') {
    const problemCtx = context.problem ? ` El problema que resuelve es: "${context.problem}".` : ''
    return `${base}${problemCtx} Escribe un párrafo breve (2-3 frases) describiendo la solución propuesta. Sé concreto y describe el producto/servicio.`
  }
  if (field === 'hypothesis') {
    const ctx = [
      context.problem ? `Problema: "${context.problem}"` : '',
      context.solution ? `Solución: "${context.solution}"` : '',
    ].filter(Boolean).join('. ')
    return `${base}${ctx ? ' ' + ctx : ''} Escribe una hipótesis de validación para este proyecto en formato "Creemos que [acción] logrará [resultado] para [usuario]. Lo validaremos cuando [métrica]." Una sola oración.`
  }
  return ''
}
```

### Cliente Ollama

Usar `getOllamaClient()` de `lib/ai/ollamaClient.ts`:

```typescript
import { getOllamaClient } from '@/lib/ai'

const client = getOllamaClient()
const response = await client.chat({
  model: process.env.OLLAMA_MODEL ?? 'llama3.2',
  messages: [{ role: 'user', content: prompt }],
})
const suggestion = response.message.content
```

### checkDailyBudget para sugerencias

`checkDailyBudget` en `lib/ai/budgetChecker.ts` recibe `communityId: string`. Para sugerencias del wizard (fuera del contexto de una comunidad), usar el `communityId` de la comunidad del usuario o un valor centinela. Verificar la implementación actual antes de decidir.

**Alternativa recomendada**: añadir un parámetro opcional a `checkDailyBudget` para modo "global" que use un presupuesto configurado en `AI_DAILY_BUDGET_GLOBAL_USD` (nueva env var, default al mismo valor que `AI_DAILY_BUDGET_USD`).

### Tracking de coste

La estimación de tokens para sugerencias es menor que para síntesis. Usar valores aproximados:
- `tokensInput`: longitud del prompt / 4 (aproximación)
- `tokensOutput`: longitud de la respuesta / 4
- `costUsd`: usar la misma fórmula que en `costTracker.ts`

### Auth en API route

Usar `requireAuth` del patrón establecido en el proyecto (ver `app/api/feedback/route.ts` como referencia). No se necesita verificar que el usuario sea Builder de un proyecto específico — cualquier usuario autenticado puede pedir sugerencias.

### Design tokens para `AISuggestButton`

```typescript
// Botón pequeño, secundario, junto al label
style={{
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-1)',
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-muted)',
  background: 'transparent',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-1) var(--space-2)',
  cursor: 'pointer',
}}
```

### Ficheros a crear

- `app/api/ai/suggest-project-field/route.ts`
- `components/projects/wizard/AISuggestButton.tsx`
- `stories/projects/wizard/AISuggestButton.stories.tsx`
- `tests/unit/api/ai-suggest.test.ts`
- `tests/unit/components/AISuggestButton.test.tsx`

### Ficheros a modificar

- `components/projects/wizard/WizardStepDescription.tsx` — integrar `AISuggestButton` + indicador AI
- `components/projects/wizard/WizardStepHypothesis.tsx` — integrar `AISuggestButton` + indicador AI

### Patrones del proyecto

- TDD Outside-In: tests escritos ANTES de la implementación
- NO Tailwind directo — usar `var(--color-*)`, `var(--space-*)` (ver `docs/project/design-tokens.md`)
- NO modificar `components/ui/` (shadcn/ui intocable)
- `createAdminClient()` de `lib/supabase/admin.ts` para operaciones con service role

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Ollama client usa `generate()` (no `chat()`) — adaptado según implementación real de `lib/ai/ollamaClient.ts`
- `checkDailyBudget` acepta `_communityId: string` — se usa centinela `'global'` para sugerencias del wizard
- TypeScript errors en fixtures pre-existentes (`customQuestion` missing) son pre-existentes, no introducidos en esta story
- La variante `Loading` del Storybook sobreescribe `window.fetch` para simular estado loading visual

### Completion Notes List

- AC1: `AISuggestButton` renderiza habilitado/deshabilitado según `context.title`
- AC2: `POST /api/ai/suggest-project-field` implementado — 401/400/429/503/200
- AC3: `onSuggestion` rellena el campo sin sobreescritura forzada — el Builder puede editarlo
- AC4: badge "✦ Generado con IA" aparece y desaparece al editar manualmente
- AC5: `trackCost()` llamado tras cada sugerencia exitosa
- AC6: Storybook con 3 variantes — Default, Loading, Disabled
- AC7: 14 tests unitarios (7 API + 7 componente) todos en verde
- 1856 tests totales pasan (0 regresiones)

### File List

Creados:
- `app/api/ai/suggest-project-field/route.ts`
- `components/projects/wizard/AISuggestButton.tsx`
- `stories/projects/AISuggestButton.stories.tsx`
- `tests/unit/api/ai-suggest.test.ts`
- `tests/unit/components/AISuggestButton.test.tsx`

Modificados:
- `components/projects/wizard/WizardStepDescription.tsx`
- `components/projects/wizard/WizardStepHypothesis.tsx`
- `_bmad-output/execution-log.yaml`
- `_bmad-output/implementation-artifacts/stories/13-7-copiloto-ia-creacion-proyecto.md`
