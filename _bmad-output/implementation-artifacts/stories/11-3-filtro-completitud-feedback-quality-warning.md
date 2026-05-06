# Story 11.3: Filtro de completitud del feedback + quality warning

Status: ready-for-dev

## Metadata

- **Epic:** 11 — Calidad del Feedback y Reciprocidad
- **Story key:** 11.3
- **Prerequisito:** Story 11.1 completada (columna `quality_score` en `feedbacks` y `quality_threshold` en `projects` disponibles en BD)
- **Phase:** Development
- **Agent:** Homer
- **Flow:** Full Flow (Homer)

## Story

Como Builder,
quiero ver cuántos de los feedbacks que he recibido son "completos" (según un umbral de calidad),
para poder identificar si la comunidad está dando feedback superficial y actuar en consecuencia.

## Acceptance Criteria

**AC-1 — Función pura `calculateQualityScore`**
Dado que importo `calculateQualityScore` de `lib/utils/feedbackQuality.ts`,
cuando la llamo con un objeto `textResponses` donde los textos tienen longitudes variadas,
entonces devuelve un número entre 0.0 y 1.0 (ambos inclusive),
y el score sigue la fórmula: `min(1.0, totalChars / TARGET_CHARS)` donde `totalChars` es la suma de longitudes de todos los valores del objeto y `TARGET_CHARS = 200` (constante exportada),
y un texto de 200+ caracteres en total devuelve 1.0,
y un texto de 100 caracteres en total devuelve 0.5,
y un objeto vacío `{}` devuelve 0.0.

**AC-2 — `quality_score` se calcula y persiste al crear un feedback**
Dado que un Reviewer envía un feedback vía `POST /api/feedback`,
cuando el handler procesa la petición,
entonces antes de llamar a `feedbackRepo.create`, calcula `calculateQualityScore(textResponses)`,
y pasa `qualityScore` al repositorio para que se persista en `feedbacks.quality_score`.

**AC-3 — `feedbackRepo.create` acepta `qualityScore`**
Dado que el repositorio `feedback.repository.ts` recibe `qualityScore` en los datos de creación,
cuando ejecuta el insert en Supabase,
entonces incluye `quality_score: data.qualityScore` en el objeto de insert,
y el valor queda almacenado correctamente en la columna NUMERIC(4,2) de la tabla `feedbacks`.

**AC-4 — Componente `FeedbackQualityStats` muestra conteo de completos / totales**
Dado que el Builder ve la sidebar de su proyecto con al menos 1 feedback,
cuando el proyecto tiene `feedbacks` con `quality_score` calculado,
entonces aparece un bloque con `data-testid="feedback-quality-stats"` que muestra "X feedbacks completos de Y totales",
donde X = feedbacks con `quality_score >= project.quality_threshold`,
y Y = total de feedbacks del proyecto.

**AC-5 — Warning cuando más del 40% de feedbacks son incompletos**
Dado que el Builder ve su proyecto y más del 40% de los feedbacks tienen `quality_score < project.quality_threshold`,
cuando se renderiza el bloque de stats de calidad,
entonces aparece un banner con `data-testid="feedback-quality-warning"` con el texto "La mayoría de tus feedbacks son breves — considera añadir una pregunta más específica",
y el banner usa el estilo de advertencia del proyecto (`var(--color-warning-bg)` / `var(--color-warning-text)` si existe, o bien `var(--color-needs-bg)` / `var(--color-needs-text)` como fallback semáforo).

**AC-6 — Sin warning cuando el ratio de incompletos es <= 40%**
Dado que el Builder ve su proyecto y el 40% o menos de los feedbacks tienen `quality_score < project.quality_threshold`,
cuando se renderiza el bloque de stats de calidad,
entonces el banner de warning NO aparece en el DOM.

**AC-7 — Sin bloque de stats cuando no hay feedbacks**
Dado que el Builder ve su proyecto sin ningún feedback,
cuando se renderiza la sidebar del owner,
entonces el bloque `feedback-quality-stats` NO aparece en el DOM.

**AC-8 — Tests pasan al 100%**
Dado que ejecuto `npm run test:unit`,
cuando se procesan los tests de esta story,
entonces todos los tests nuevos pasan al 100% y los tests existentes no se rompen.

## Tasks / Subtasks

- [ ] **T1** — TDD: función pura `calculateQualityScore` (RED → GREEN → REFACTOR)
  - [ ] T1.1 Crear `tests/unit/utils/feedbackQuality.test.ts`
  - [ ] T1.2 Escribir test: `{}` → 0.0
  - [ ] T1.3 Escribir test: `{ p4: "a".repeat(100) }` → 0.5
  - [ ] T1.4 Escribir test: `{ p4: "a".repeat(200) }` → 1.0
  - [ ] T1.5 Escribir test: `{ p4: "a".repeat(300) }` → 1.0 (capped)
  - [ ] T1.6 Escribir test: múltiples campos suman sus longitudes
  - [ ] T1.7 Escribir test: devuelve siempre un número en [0.0, 1.0]
  - [ ] T1.8 Crear `lib/utils/feedbackQuality.ts` con `TARGET_CHARS = 200` y `calculateQualityScore`
  - [ ] T1.9 Verificar todos los tests en verde

- [ ] **T2** — TDD: `POST /api/feedback` — calcula y persiste `quality_score` (RED → GREEN)
  - [ ] T2.1 Escribir test de integración: body válido → response contiene `quality_score` calculado
  - [ ] T2.2 Escribir test: `quality_score` es un número entre 0 y 1
  - [ ] T2.3 Actualizar `POST /api/feedback` — importar `calculateQualityScore` y pasarlo al repo
  - [ ] T2.4 Verificar tests en verde

- [ ] **T3** — TDD: `feedbackRepo.create` — incluye `quality_score` en insert (RED → GREEN)
  - [ ] T3.1 Escribir test unitario: `create` con `qualityScore: 0.75` → insert incluye `quality_score: 0.75`
  - [ ] T3.2 Actualizar firma de `create` en `lib/repositories/feedback.repository.ts` — añadir `qualityScore: number` al tipo de datos de entrada
  - [ ] T3.3 Añadir `quality_score: data.qualityScore` al objeto de insert
  - [ ] T3.4 Verificar tests en verde

- [ ] **T4** — TDD: componente `FeedbackQualityStats` (RED → GREEN → REFACTOR)
  - [ ] T4.1 Crear `tests/unit/feedback/FeedbackQualityStats.test.tsx`
  - [ ] T4.2 Escribir test: sin feedbacks → componente no renderiza nada
  - [ ] T4.3 Escribir test: 3 feedbacks, 2 completos (score >= 0.6) → "2 feedbacks completos de 3 totales"
  - [ ] T4.4 Escribir test: 5 feedbacks, 2 completos (40%) → warning NO visible (ratio exacto = 40% no supera el umbral)
  - [ ] T4.5 Escribir test: 5 feedbacks, 2 completos (60% incompletos) → warning visible con el texto exacto
  - [ ] T4.6 Escribir test: 1 feedback completo de 1 → "1 feedbacks completos de 1 totales" (sin warning)
  - [ ] T4.7 Crear `components/feedback/FeedbackQualityStats.tsx` — componente puro que recibe `feedbacks` y `qualityThreshold`
  - [ ] T4.8 Verificar todos los tests en verde

- [ ] **T5** — Integrar `FeedbackQualityStats` en la sidebar del owner
  - [ ] T5.1 Localizar donde se renderiza la sidebar del owner en la página de detalle del proyecto
  - [ ] T5.2 Pasar `feedbacks` (con `quality_score`) y `project.quality_threshold` al componente
  - [ ] T5.3 Asegurarse de que `findByProject` en el repositorio devuelve `quality_score` en el SELECT

- [ ] **T6** — Actualizar `findByProject` en el repositorio para incluir `quality_score`
  - [ ] T6.1 Añadir `quality_score` al SELECT de `findByProject` en `lib/repositories/feedback.repository.ts`
  - [ ] T6.2 Verificar que el mapper `feedbackFromRow` ya mapea `quality_score → qualityScore` (done en 11.1)

- [ ] **T7** — Storybook
  - [ ] T7.1 Crear `stories/feedback/FeedbackQualityStats.stories.tsx` con stories: `SinFeedbacks`, `MayoriaCompletos`, `MayoriaIncompletos` (warning visible), `ExactoUmbral`

## Dev Notes

### Contexto de negocio

El quality score es un proxy simple de la completitud del feedback basado en la longitud total del texto. No es un juicio de calidad real — es un incentivo para que los Reviewers escriban respuestas más elaboradas. El Builder ve este indicador en la sidebar de su proyecto y puede actuar añadiendo una pregunta custom (Story 11.2) para guiar mejor a los Reviewers.

**Fórmula de quality score:**
```
score = min(1.0, totalCharsInTextResponses / 200)
```
- `TARGET_CHARS = 200` — constante exportada desde `lib/utils/feedbackQuality.ts`
- Score entre 0.0 y 1.0 (NUMERIC(4,2) en BD → hasta 2 decimales)
- Un feedback con 200+ caracteres en total tiene score = 1.0 (completo)
- El campo `quality_threshold` en el proyecto tiene DEFAULT 0.6 (60% de 200 chars = 120 chars mínimo)

**Ratio de incompletos para mostrar warning:**
```
incompleteRatio = incompleteCount / totalCount
showWarning = incompleteRatio > 0.4  // más del 40% son incompletos
```

### Arquitectura / Componentes

**Ficheros a crear:**

| Fichero | Descripción |
|---|---|
| `lib/utils/feedbackQuality.ts` | Función pura `calculateQualityScore` + constante `TARGET_CHARS` |
| `components/feedback/FeedbackQualityStats.tsx` | Componente: stats de completitud + warning condicional |
| `stories/feedback/FeedbackQualityStats.stories.tsx` | Storybook stories |

**Ficheros a modificar:**

| Fichero | Cambio |
|---|---|
| `app/api/feedback/route.ts` | Calcular `qualityScore` antes de llamar al repo |
| `lib/repositories/feedback.repository.ts` | Añadir `qualityScore` al `create()` y `quality_score` al SELECT de `findByProject` |

### Estrategia de implementación

**TDD Outside-In:** Empezar por la función pura `calculateQualityScore` (lógica de negocio sin dependencias). Luego el componente. Luego la integración en la API.

**Orden recomendado:**
1. T1 — `calculateQualityScore` (función pura, tests unitarios)
2. T4 — `FeedbackQualityStats` (componente puro)
3. T3 — `feedbackRepo.create` (añadir campo)
4. T2 — `POST /api/feedback` (integración)
5. T6 — SELECT del repo
6. T5 — integración en la página de detalle
7. T7 — Storybook

**Props del componente `FeedbackQualityStats`:**
```typescript
interface FeedbackQualityStatsProps {
  feedbacks: Array<{ qualityScore: number | null }>
  qualityThreshold: number  // project.qualityThreshold (default 0.6)
}
```

**Nota importante:** `findByProject` en el repositorio actualmente NO incluye `quality_score` en el SELECT. Hay que añadirlo para que el mapper pueda mapear el campo. Esta es la tech debt LOW-2 identificada en el CR de Story 11.1.

**Tokens de color para el warning:**
Usar los tokens semáforo `needs` que ya existen en el proyecto: `var(--color-needs-bg)` y `var(--color-needs-text)`. Si el proyecto tiene tokens `warning`, usar esos en su lugar. Verificar en `docs/project/design-tokens.md` antes de implementar.

### Tests a crear

```
tests/unit/utils/feedbackQuality.test.ts          (nuevo)
tests/unit/feedback/FeedbackQualityStats.test.tsx  (nuevo)
tests/integration/feedback/feedback-quality.test.ts  (nuevo)
```
