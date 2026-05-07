# Story 13.8 — Interpretación contextual del Proof Score

**Epic:** 13 — Iteración, Cierre del Loop y Copiloto IA
**Story key:** 13.8
**Status:** dev-complete
**Fase:** GROWTH 2.1
**Prerequisito:** Story 12.2 completada (Ollama + lib/ai), Story 13.6 completada (Proof Score por iteración)

---

## User Story

**Como** Builder de un proyecto en Proof Day,
**quiero** ver una interpretación en lenguaje natural de mi Proof Score,
**para que** entienda qué significa el valor numérico y qué pasos concretos debería tomar para mejorar la validación de mi proyecto.

---

## Acceptance Criteria

### AC1 — Interpretación visible en `ProofScoreSidebar` cuando hay score

**Given** que el Builder accede al detalle de su proyecto y el Proof Score está disponible (>= 3 feedbacks de calidad),
**When** se carga la sidebar,
**Then** se muestra una interpretación en texto debajo de `ValidationSignalCard` con el `data-testid="score-interpretation"`.

**Given** que el Proof Score no está disponible (< 3 feedbacks), o el proyecto está en estado `waiting`,
**When** se renderiza la sidebar,
**Then** la sección de interpretación NO se muestra.

### AC2 — GET /api/projects/[id]/score-interpretation

**Given** que el Builder llama a `GET /api/projects/[id]/score-interpretation` con un token válido,
**When** el proyecto tiene Proof Score disponible,
**Then** retorna `200 {interpretation: string}` — un párrafo breve (2-4 frases) en español.

**Given** que el usuario no es el Builder del proyecto,
**Then** retorna `403 {error: 'Forbidden'}`.

**Given** que el usuario no está autenticado,
**Then** retorna `401`.

**Given** que el proyecto no tiene suficientes feedbacks para calcular el Proof Score,
**Then** retorna `400 {error: 'INSUFFICIENT_DATA'}`.

**Given** que Ollama no está disponible,
**Then** retorna `503 {error: 'AI_UNAVAILABLE'}`.

**Given** que el presupuesto diario está agotado,
**Then** retorna `429 {error: 'BUDGET_EXCEEDED'}`.

### AC3 — Contenido de la interpretación

**Given** que el Proof Score label es `"Promising"`,
**When** se genera la interpretación,
**Then** el texto menciona aspectos positivos y sugiere continuar con la iteración o la decisión de avanzar.

**Given** que el Proof Score label es `"Needs iteration"`,
**When** se genera la interpretación,
**Then** el texto identifica que hay señales mixtas y sugiere iterar sobre el problema/solución.

**Given** que el Proof Score label es `"Weak"`,
**When** se genera la interpretación,
**Then** el texto indica que la propuesta necesita revisión profunda y sugiere replantear el problema o la solución.

### AC4 — Estado de carga durante la generación

**Given** que la interpretación está siendo generada (llamada a la API en curso),
**When** el Builder mira la sidebar,
**Then** se muestra un skeleton loader o texto "Analizando tu Proof Score..." con `data-testid="score-interpretation-loading"`.

### AC5 — Tracking de coste

**Given** que una interpretación se genera correctamente,
**Then** se registra el coste en `ai_cost_tracking` usando `trackCost()` con `communityId` del proyecto.

### AC6 — Storybook

**Given** que se consulta Storybook,
**When** se navega a `ProofScoreSidebar`,
**Then** hay al menos 3 variantes que muestran la interpretación:
- `WithPromisingInterpretation` — score Promising con interpretación visible
- `WithNeedsIterationInterpretation` — score Needs Iteration con interpretación visible
- `InterpretationLoading` — estado de carga de la interpretación

### AC7 — Tests

**Given** que se ejecuta `npm run test:unit`,
**Then** hay tests para:
- `GET /api/projects/[id]/score-interpretation`: 401 sin auth, 403 si no es builder, 400 sin datos suficientes, 429 budget agotado, 503 Ollama no disponible, 200 con interpretación válida
- `ProofScoreSidebar`: muestra `score-interpretation` cuando score disponible, oculta cuando no hay score, muestra skeleton durante la carga

---

## Tasks de implementación

> Seguir TDD Outside-In: escribir test primero, implementar, verificar verde.

### Task 1 — API route `GET /api/projects/[id]/score-interpretation`

Crear `app/api/projects/[id]/score-interpretation/route.ts`:

```typescript
// GET /api/projects/[id]/score-interpretation
// Auth: requireAuth + verificar que el user es el builder del proyecto
```

Flujo:
1. `requireAuth` → 401 si no autenticado
2. Obtener proyecto por `id` → 404 si no existe
3. Verificar `project.builder_id === user.id` → 403 si no es el builder
4. Llamar a `GET /api/proof-score/[id]` internamente (o reusar la lógica) para obtener el score actual
5. Si `feedbackCount < 3` → 400 `INSUFFICIENT_DATA`
6. `checkDailyBudget(project.community_id)` → 429 si agotado
7. Construir prompt con score + contexto del proyecto
8. Llamar a Ollama via `getOllamaClient()`
9. `trackCost(...)` con el coste estimado
10. Retornar `{interpretation: string}`

### Task 2 — Prompt de interpretación

```typescript
function buildInterpretationPrompt(params: {
  title: string
  problem: string
  scoreLabel: ProofScoreLabel
  average: number
  feedbackCount: number
}): string {
  const { title, problem, scoreLabel, average, feedbackCount } = params
  const pct = Math.round(average)

  return `Eres un analista de producto que ayuda a emprendedores a interpretar los resultados de validación de su proyecto.
  
El proyecto "${title}" tiene el siguiente resultado de validación:
- Puntuación: ${pct}/100 (${feedbackCount} feedbacks recibidos)
- Estado: ${scoreLabel}
- Problema que resuelve: ${problem}

Escribe una interpretación breve (2-4 frases) en español que:
1. Explique qué significa este resultado en términos prácticos para el emprendedor
2. Sugiera 1 acción concreta que el emprendedor podría tomar como siguiente paso
3. Sea directa, útil y sin tecnicismos

Solo el texto de la interpretación, sin título ni bullet points.`
}
```

### Task 3 — Integrar interpretación en `ProofScoreSidebar`

Modificar `components/proof-score/ProofScoreSidebar.tsx`:

- Añadir estado `interpretation: string | null` y `isLoadingInterpretation: boolean`
- Después de obtener el `score` exitosamente, lanzar `fetch('/api/projects/[projectId]/score-interpretation')` (fire-after-score)
- Mostrar skeleton durante la carga
- Mostrar el texto de la interpretación con `data-testid="score-interpretation"` bajo `ValidationSignalCard`

```typescript
// Ejemplo de integración
const [interpretation, setInterpretation] = useState<string | null>(null)
const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false)

useEffect(() => {
  if (!score) return
  setIsLoadingInterpretation(true)
  fetch(`/api/projects/${projectId}/score-interpretation`)
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (data?.interpretation) setInterpretation(data.interpretation)
    })
    .catch(() => {/* silencioso — interpretación es opcional */})
    .finally(() => setIsLoadingInterpretation(false))
}, [projectId, score])
```

### Task 4 — Tests de la API (TDD — escribir primero)

Crear `tests/unit/api/score-interpretation.test.ts`:
- Test 401: sin token
- Test 403: usuario no es builder
- Test 400: score con < 3 feedbacks
- Test 429: checkDailyBudget retorna false
- Test 503: Ollama lanza error
- Test 200: retorna `{interpretation: string}` con texto generado

### Task 5 — Tests del componente `ProofScoreSidebar` (ampliar)

Ampliar `tests/unit/components/ProofScoreSidebar.test.tsx` (o crear si no existe):
- Muestra `score-interpretation` cuando el score está disponible y la interpretación cargó
- Muestra `score-interpretation-loading` mientras carga la interpretación
- NO muestra `score-interpretation` cuando el score es null (waiting state)
- La interpretación es opcional: si la API falla, el componente no rompe

### Task 6 — Storybook (ampliar `ProofScoreSidebar.stories.tsx`)

Añadir variantes a las stories existentes de `ProofScoreSidebar`:
- `WithPromisingInterpretation`
- `WithNeedsIterationInterpretation`
- `InterpretationLoading`

---

## Dev Notes

### No hay caché para la interpretación

La interpretación se genera on-demand cada vez que el Builder ve su ProofScore. No se persiste en base de datos (contrariamente a la síntesis de feedbacks que sí se persiste en `ai_summaries`). 

**Razón**: el Proof Score puede cambiar con cada feedback nuevo (especialmente relevante ahora que está filtrado por iteración). Persistir la interpretación añadiría complejidad de invalidación sin beneficio claro para un texto de 2-4 frases.

**Implicación de coste**: cada carga de la página del proyecto por el Builder genera una llamada a Ollama. El coste es pequeño (prompt + respuesta corta), pero documentado en `ai_cost_tracking`. Si el coste se vuelve relevante, se puede añadir caché con TTL de 1h en una iteración futura.

### Reutilizar la lógica del Proof Score

El endpoint `GET /api/proof-score/[id]` ya calcula el score (Stories 5.1, 13.6). En el endpoint de interpretación, en lugar de reimplementar la lógica, hacer una llamada interna al endpoint de proof-score o reutilizar la función de cálculo directamente:

```typescript
// Opción A: reutilizar función de cálculo directamente
import { calculateProofScore } from '@/lib/utils/proof-score'

// Opción B: llamar al endpoint internamente (no recomendado — introduce acoplamiento HTTP)
```

Verificar si existe `lib/utils/proof-score.ts` o si el cálculo está inline en el API route.

### Integración en `ProofScoreSidebar` — timing

La interpretación se carga DESPUÉS de que el score esté disponible, para no bloquear la visualización del score. El flujo es:
1. Cargar score (ya implementado)
2. Cuando score llega → disparar fetch de interpretación (useEffect con score como dependencia)
3. Mostrar skeleton mientras carga
4. Mostrar texto cuando llega (o nada si falla silenciosamente)

### ProofScoreLabel → mensaje contextual

Para hacer la interpretación más rica incluso sin IA, se puede añadir un mensaje estático por nivel además del texto generado:

| Label | Mensaje estático |
|---|---|
| Promising | "Tu proyecto está resonando con tu audiencia objetivo." |
| Needs iteration | "Hay señales de interés, pero también áreas de mejora claras." |
| Weak | "La propuesta actual no está conectando con los reviewers." |

Este mensaje puede mostrarse inmediatamente (sin esperar a la IA) y el texto generado reemplazarlo cuando llega.

### Auth y ownership

En este endpoint, solo el Builder puede ver la interpretación (mismo patrón que el Proof Score que ya está restringido a `isBuilder`). Usar `requireAuth` + verificar `project.builder_id === user.id`.

### Ficheros a crear

- `app/api/projects/[id]/score-interpretation/route.ts`
- `tests/unit/api/score-interpretation.test.ts`

### Ficheros a modificar

- `components/proof-score/ProofScoreSidebar.tsx` — añadir interpretación post-score
- `stories/proof-score/ProofScoreSidebar.stories.tsx` — añadir variantes con interpretación

### Patrones del proyecto

- TDD Outside-In: tests escritos ANTES de la implementación
- NO Tailwind directo — usar `var(--color-*)`, `var(--space-*)` (ver `docs/project/design-tokens.md`)
- Fire-after-score: la interpretación se carga asíncronamente DESPUÉS del score, sin bloquear la UI
- Errores silenciosos: si la interpretación falla, el componente no rompe — la interpretación es enriquecimiento opcional

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

N/A — implementación limpia sin errores en runtime.

### Completion Notes List

- TDD Outside-In seguido estrictamente: tests escritos antes de la implementación.
- El mock de Supabase para la query de feedbacks (sin `.single()`) se resolvió usando `mockResolvedValue` en el método `eq` final.
- La interpretación se carga de forma asíncrona DESPUÉS del score (fire-after-score) para no bloquear la UI.
- `trackCost` usa `void` para no bloquear la respuesta HTTP.
- Pre-existing TS errors (customQuestion, templates.route) no introducidos por esta story.
- 1888 tests verdes al finalizar.

### File List

- `app/api/projects/[id]/score-interpretation/route.ts` — CREATED
- `components/proof-score/ProofScoreSidebar.tsx` — MODIFIED
- `stories/proof-score/ProofScoreSidebar.stories.tsx` — MODIFIED
- `tests/unit/proof-score/scoreInterpretation.api.test.ts` — CREATED
- `tests/unit/components/ProofScoreSidebarInterpretation.test.tsx` — CREATED
