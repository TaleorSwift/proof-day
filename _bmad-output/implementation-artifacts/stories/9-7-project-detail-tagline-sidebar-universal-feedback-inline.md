# Story 9.7: Project Detail — tagline, caption imagen, hipótesis 🔬, sidebar universal y feedback inline

Status: review

## Story

Como Reviewer o Builder,
quiero que el detalle de un proyecto muestre el tagline, la sidebar con señal de validación y el formulario de feedback inline visibles para todos,
para dar o recibir feedback con toda la información relevante a la vista.

## Acceptance Criteria

1. **[AC-1]** Dado que navego al detalle de cualquier proyecto, cuando la página carga, entonces:
   - Debajo del `<h1>` con el título aparece el tagline del proyecto como subtítulo (text-sm, color-text-muted, 1 línea) — se omite si el campo `tagline` es null/vacío.
   - Debajo de la imagen destacada aparece el caption `"Usa estas imágenes para dar feedback más preciso."` (text-xs, muted) — solo cuando hay al menos una imagen.
   - La sección de hipótesis tiene heading `"🔬 Hipótesis a validar"` en lugar del actual `"Hipótesis"`.

2. **[AC-2]** Dado que el proyecto tiene `status = 'live'` y el usuario NO es el owner, cuando navega al detalle, entonces:
   - La sidebar derecha es visible (el grid pasa a `1fr + clamp(280px, 30%, 380px)`).
   - La sidebar muestra `ValidationSignalCard` con: indicador semáforo (`SignalIndicator`), barra `"Comprenden el problema X%"` (`ProgressBar`), barra `"Lo usarían X%"` (`ProgressBar`), texto `"Basado en N feedbacks"`, disclaimer en itálica `"Esta señal se actualiza con cada nuevo feedback."`.
   - Debajo de `ValidationSignalCard` aparece `FeedbackFormInline` (nuevo componente — ver Dev Notes).
   - Al enviar con respuestas válidas, el feedback se persiste y el formulario muestra un estado de confirmación (`data-testid="feedback-form-inline-confirmation"`).

3. **[AC-3]** Dado que el proyecto tiene `status = 'inactive'`, cuando cualquier usuario navega al detalle, entonces:
   - La sidebar es visible para TODOS (owner y no-owner).
   - Muestra `ValidationSignalCard` (idéntico al AC-2).
   - Debajo de `ValidationSignalCard` aparece el texto `"Esta idea ya no acepta feedback."` (text-sm, muted, itálica) en lugar de `FeedbackFormInline`.
   - No aparece `FeedbackCTA` (ya está condicionado a `status === 'live'` en la columna principal).

4. **[AC-4]** Dado que el usuario es el OWNER del proyecto, cuando navega al detalle (independientemente del status), entonces:
   - La sidebar es visible.
   - Muestra `ValidationSignalCard` + `ProofScoreSidebar` debajo.
   - **NO** muestra `FeedbackFormInline` (el owner no puede dar feedback de su propio proyecto).
   - `FeedbackList` se mantiene dentro de la sidebar del owner (en el bloque "Feedback recibido" existente).

5. **[AC-5]** Dado que hay feedbacks con `text_responses` que incluyen las respuestas de las preguntas binarias (p1, p2), cuando se renderizan en "Perspectivas del equipo", entonces:
   - Cada `FeedbackEntry` muestra: nombre del revisor, pill `"Problema: sí/parcialmente/no"` (basado en `scores.p1`), pill `"Lo usaría: sí/no"` (basado en `scores.p2`), texto principal (`text_responses.p4`), texto de mejora si existe.
   - Los pills usan la paleta semáforo: `1 → color-weak-text/bg`, `2 → color-needs-text/bg`, `3 → color-promising-text/bg`.

6. **[AC-6]** Dado que ejecuto `npm run storybook`, cuando navego a `"proof-score/ValidationSignalCard"`, entonces:
   - Existen stories: `Promising`, `NeedsIteration`, `Weak` (ya existen — verificar que el shape actualizado de props es compatible).
   - Existe story `SinDatos` (nueva) para cuando `score` es null o no hay feedbacks suficientes.
   - Cuando navego a `"feedback/FeedbackFormInline"`, existen stories: `EstadoInicial`, `Cargando`, `Confirmacion`.

7. **[AC-7]** Dado que ejecuto la suite de tests, cuando todos pasan, entonces lint/tsc/tests son verdes (≥370 tests pasando).

## Tasks / Subtasks

- [x] **T1** — Modificar `app/(app)/communities/[slug]/projects/[id]/page.tsx`
  - [x] T1.1 Añadir `tagline` al SELECT de Supabase (junto a los campos existentes)
  - [x] T1.2 Añadir `scores` al SELECT de `feedbacks` en el repositorio (necesario para pills de AC-5)
  - [x] T1.3 Refactorizar `gridTemplateColumns` para que la sidebar sea visible cuando `isOwner || project.status === 'live' || project.status === 'inactive'`
  - [x] T1.4 Mover el `<aside>` fuera del guard `{isOwner && ...}` — nueva lógica condicional por rol+status
  - [x] T1.5 Añadir renderizado del tagline debajo del `<h1>` (condicional a `project.tagline`)
  - [x] T1.6 Añadir caption de imagen ("Usa estas imágenes...") directamente en page.tsx (Opción A — mínimo cambio)
  - [x] T1.7 Cambiar heading de hipótesis: `"Hipótesis"` → `"🔬 Hipótesis a validar"`
  - [x] T1.8 Actualizar `FeedbackEntryData[]` mapping para incluir `scores`
  - [x] T1.9 Remover `FeedbackCTA` de la columna principal para reviewers en live (sidebar lo reemplaza)

- [x] **T2** — Nuevo componente `components/feedback/FeedbackFormInline.tsx`
  - [x] T2.1 Crear el componente `'use client'` con las preguntas reducidas
  - [x] T2.2 Preguntas: p1 (Sí=3/Parcialmente=2/No=1), p2 (Sí=3/No=1), textarea p4 (min 10 chars, obligatorio)
  - [x] T2.3 Botón `"Compartir insight"` (naranja: `var(--color-accent)`, full-width, `data-testid="feedback-form-inline-submit"`)
  - [x] T2.4 Reutilizar `submitFeedback` — p3=2 (neutral, no preguntado)
  - [x] T2.5 Estado de confirmación: `data-testid="feedback-form-inline-confirmation"`
  - [x] T2.6 Estado de error inline con `role="alert"`
  - [x] T2.7 Deshabilitar submit mientras carga

- [x] **T3** — Refactorizar `ValidationSignalCard` para sidebar universal
  - [x] T3.1 Nuevas props: `understandPercent`, `wouldUsePercent`, `feedbackCount`
  - [x] T3.2 Dos barras separadas: "Comprenden el problema" y "Lo usarían"
  - [x] T3.3 Disclaimer en itálica: "Esta señal se actualiza con cada nuevo feedback."
  - [x] T3.4 Estado SinDatos: "Aún no hay datos de validación" cuando feedbackCount=0

- [x] **T4** — Actualizar `lib/repositories/feedback.repository.ts`
  - [x] T4.1 `findByProject` incluye `scores` en el select

- [x] **T5** — Actualizar `lib/types/feedback.ts`
  - [x] T5.1 Campo `scores?: FeedbackScores` añadido a `FeedbackEntryData`

- [x] **T6** — Actualizar `components/feedback/FeedbackEntry.tsx` para pills (AC-5)
  - [x] T6.1 Pills condicionadas a `data.scores`
  - [x] T6.2 Pill "Problema: sí/parcialmente/no" basado en `scores.p1`
  - [x] T6.3 Pill "Lo usaría: sí/no" basado en `scores.p2` (2 → no)
  - [x] T6.4 Paleta semáforo con tokens: weak/needs/promising bg+text

- [x] **T7** — Storybook
  - [x] T7.1 `stories/feedback/FeedbackFormInline.stories.tsx` — 3 stories
  - [x] T7.2 `stories/proof-score/ValidationSignalCard.stories.tsx` — story `SinDatos`
  - [x] T7.3 Stories de `ValidationSignalCard` actualizadas a nuevas props

- [x] **T8** — Tests
  - [x] T8.1 `tests/unit/feedback/FeedbackFormInline.test.tsx` (nuevo) — 12 tests
  - [x] T8.2 `tests/unit/feedback/FeedbackEntry.test.tsx` — 7 tests nuevos de pills
  - [x] T8.3 `tests/unit/projects/ProjectDetailSections.test.tsx` — no afectado (caption en page.tsx)
  - [x] T8.4 `tests/unit/proof-score/ValidationSignalCard.test.tsx` — reescrito: 9 tests nuevos

- [x] **T9** — Documentación
  - [x] T9.1 `docs/project/modules/projects.md` — reglas de sidebar según rol/status
  - [x] T9.2 `docs/project/modules/feedback.md` — FeedbackFormInline y pills

- [x] **T10** — Verificación final
  - [x] T10.1 `npm run lint` — verde
  - [x] T10.2 `npx tsc --noEmit` — verde
  - [x] T10.3 `npx vitest run tests/unit/` — verde (383 tests, ≥370 ✓)

## Dev Notes

### Estado actual de `app/(app)/communities/[slug]/projects/[id]/page.tsx`

El fichero tiene 318 líneas. El SELECT actual de la query de proyecto es:

```typescript
.select('id, title, problem, solution, hypothesis, image_urls, status, builder_id, community_id, created_at, updated_at, decision, target_user, demo_url, feedback_topics')
```

**Falta `tagline`** — hay que añadirlo. El campo existe en DB desde Story 9.1.

El grid de layout (línea 110):
```typescript
gridTemplateColumns: isOwner ? 'minmax(0, 1fr) clamp(280px, 30%, 380px)' : '1fr',
```

El `<aside>` está envuelto completamente en `{isOwner && (...)}` (líneas 267–313). Hay que sacar esta lógica fuera.

El `<aside>` actual para owner contiene:
1. Bloque con `FeedbackCounter` + `FeedbackList` (solo owner)
2. `ProofScoreSidebar` (solo owner, client-side fetch de /api/proof-score)

El `feedbackRepo.findByProject(id)` actual trae: `id, text_responses, created_at, profiles:reviewer_id(id, name, avatar_url)` — **falta `scores`**.

La query de feedbacks está en el Server Component (SSR). Los datos se mapean a `FeedbackEntryData[]` para pasar como prop a `TeamPerspectives`.

---

### Arquitectura de la sidebar: quién ve qué

```
status=live + !isOwner:
  sidebar visible
  └── ValidationSignalCard (con scores calculados desde feedbacks SSR)
  └── FeedbackFormInline (client — reutiliza submitFeedback)

status=inactive + cualquier usuario (!isOwner):
  sidebar visible
  └── ValidationSignalCard
  └── <p>"Esta idea ya no acepta feedback."</p>

status=inactive + isOwner:
  sidebar visible (misma que vivo owner, sin FeedbackFormInline)
  └── [bloque "Feedback recibido" + FeedbackCounter + FeedbackList]
  └── ValidationSignalCard
  └── ProofScoreSidebar

status=live + isOwner:
  sidebar visible
  └── [bloque "Feedback recibido" + FeedbackCounter + FeedbackList]
  └── ValidationSignalCard
  └── ProofScoreSidebar

status=draft + cualquier usuario:
  sidebar NO visible (solo el builder ve DraftBanner + acciones de estado)
```

**Regla del grid**: sidebar visible cuando `isOwner || project.status === 'live' || project.status === 'inactive'`

```typescript
const showSidebar = isOwner || project.status === 'live' || project.status === 'inactive'
```

---

### Cálculo de señales para ValidationSignalCard desde SSR

`ValidationSignalCard` actualmente acepta `score: ProofScoreResult` con shape `{ label, average, feedbackCount }`. Para la sidebar universal (no-owner), NO se puede hacer fetch del client a `/api/proof-score` (ese endpoint es para el owner). En cambio, se calculan las métricas directamente desde los feedbacks que ya se cargan en el Server Component:

```typescript
// Ya tenemos: feedbacks = feedbacksRaw ?? []
// scores están en cada feedback.scores como { p1: 1|2|3, p2: 1|2|3, p3: 1|2|3 }

// Calcular "comprenden el problema": % de feedbacks con p1 >= 2 (Sí o Parcialmente)
const understandCount = feedbacks.filter((f) => {
  const s = f.scores as { p1?: number } | null
  return (s?.p1 ?? 0) >= 2
}).length
const understandPercent = feedbackCount > 0
  ? Math.round((understandCount / feedbackCount) * 100)
  : 0

// Calcular "lo usarían": % de feedbacks con p2 === 3 (Sí)
const wouldUseCount = feedbacks.filter((f) => {
  const s = f.scores as { p2?: number } | null
  return s?.p2 === 3
}).length
const wouldUsePercent = feedbackCount > 0
  ? Math.round((wouldUseCount / feedbackCount) * 100)
  : 0
```

Esto significa que `ValidationSignalCard` necesita un cambio de props:

**Props actuales:**
```typescript
interface ValidationSignalCardProps {
  score: ProofScoreResult // { label, average, feedbackCount }
}
```

**Props nuevas (extendidas):**
```typescript
interface ValidationSignalCardProps {
  understandPercent: number   // % que comprende el problema
  wouldUsePercent: number     // % que lo usaría
  feedbackCount: number       // "Basado en N feedbacks"
  label?: ProofScoreLabel     // Opcional — para el semáforo (puede derivarse internamente)
}
```

> IMPORTANTE: `ProofScoreSidebar` actualmente usa `ValidationSignalCard` con `score: ProofScoreResult`. Si se cambian las props de `ValidationSignalCard`, hay que actualizar también `ProofScoreSidebar`. Alternativa: crear una nueva variante `ValidationSignalCardUniversal` para evitar romper el flow del owner. Homer debe decidir el enfoque — se recomienda refactorizar el componente existente y adaptar `ProofScoreSidebar`.

El semáforo (`SignalIndicator` con `label: ProofScoreLabel`) puede derivarse del `understandPercent`:
- `>= 70%` → `Promising` (verde)
- `>= 40%` → `Needs iteration` (ámbar)
- `< 40%` → `Weak` (rojo)

Esta lógica es similar a la de `lib/utils/proof-score.ts` (revisar si existe y reutilizar).

---

### Nuevo componente `FeedbackFormInline`

El epic especifica preguntas diferentes a las de `FeedbackDialog`. Las preguntas del nuevo formulario inline son:

| Campo | Pregunta | Opciones |
|-------|----------|----------|
| p1 | "¿Entiendes el problema?" | Sí (3) / Parcialmente (2) / No (1) |
| p2 | "¿Lo usarías?" | Sí (3) / No (1) |
| p4 (text) | "¿Qué mejorarías?" | Textarea libre, min 10 chars, obligatorio |

Notas importantes:
- `p3` (viabilidad técnica) NO aparece en el formulario inline.
- El schema de Supabase tiene `scores: { p1, p2, p3 }` — al enviar, `p3` puede ir como `2` (Parcialmente, valor neutral) ya que es obligatorio en `submitFeedbackSchema`. Revisar si el schema permite omitir p3 o si hay que adaptar el endpoint.
- `textResponses.p4` es el único campo obligatorio en el schema.
- Reutilizar `submitFeedback` de `lib/api/feedback.ts`.

**Estructura del componente:**
```typescript
'use client'

interface FeedbackFormInlineProps {
  projectId: string
  communityId: string
}

type FormState = 'idle' | 'loading' | 'success' | 'error'

export function FeedbackFormInline({ projectId, communityId }: FeedbackFormInlineProps)
```

**Validación de habilitación del submit:**
```typescript
const isValid =
  p1Score !== undefined &&
  p2Score !== undefined &&
  improvement.length >= 10
```

**Estado de confirmación:**
```tsx
<div data-testid="feedback-form-inline-confirmation">
  <p>Gracias por tu feedback. ¡Tu perspectiva es valiosa!</p>
</div>
```

**Botón submit:**
```tsx
<button
  data-testid="feedback-form-inline-submit"
  disabled={!isValid || formState === 'loading'}
  style={{
    width: '100%',
    backgroundColor: isValid && formState !== 'loading'
      ? 'var(--color-primary)'
      : 'var(--color-border)',
    color: 'var(--color-surface)',
    // ...resto tokens
  }}
>
  {formState === 'loading' ? 'Enviando...' : 'Compartir insight'}
</button>
```

**Mapeo al schema submitFeedback:**
```typescript
await submitFeedback({
  projectId,
  communityId,
  scores: {
    p1: p1Score,   // 1|2|3
    p2: p2Score,   // 1|3 (Sí/No)
    p3: 2,         // valor neutral — no preguntado al usuario
  },
  textResponses: {
    p4: improvement, // textarea obligatorio
  },
})
```

---

### Caption de imagen: ubicación exacta

Según el AC-1, el caption aparece "debajo de la imagen destacada". La imagen destacada se renderiza via `ProjectDetailFeaturedImage`. Hay dos opciones:

**Opción A (recomendada):** Añadir el caption directamente en `page.tsx` después del componente `<ProjectDetailFeaturedImage>`:
```tsx
{project.image_urls && project.image_urls.length > 0 && (
  <p
    data-testid="project-detail-image-caption"
    style={{
      fontSize: 'var(--text-xs)',
      color: 'var(--color-text-muted)',
      margin: 0,
      marginTop: 'var(--space-1)',
    }}
  >
    Usa estas imágenes para dar feedback más preciso.
  </p>
)}
```

**Opción B:** Añadir prop `caption?: string` a `ProjectDetailFeaturedImage`. Más limpio pero requiere cambiar el componente y sus tests.

Homer decide según criterio de SRP. Opción A es el mínimo cambio.

---

### Tagline display: código exacto

Debajo del bloque `<h1>` + `<StatusBadge>` (líneas 130–142 en page.tsx), añadir:

```tsx
{project.tagline && (
  <p
    data-testid="project-detail-tagline"
    style={{
      fontSize: 'var(--text-sm)',
      color: 'var(--color-text-muted)',
      margin: 0,
      lineHeight: 'var(--leading-base)',
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 1,
      WebkitBoxOrient: 'vertical',
    }}
  >
    {project.tagline}
  </p>
)}
```

---

### SELECT extendido de feedbacks (T4)

Cambiar `findByProject` en `feedback.repository.ts`:

```typescript
async findByProject(projectId: string) {
  return supabase
    .from('feedbacks')
    .select(`
      id, scores, text_responses, created_at,
      profiles:reviewer_id (id, name, avatar_url)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
},
```

El campo `scores` es un JSON en Supabase con shape `{ p1: number, p2: number, p3: number }`. Al recuperarlo habrá que castearlo: `(f.scores as { p1: number; p2: number; p3: number } | null)`.

---

### Pills en FeedbackEntry (AC-5)

Añadir en `FeedbackEntryData` (lib/types/feedback.ts):
```typescript
scores?: FeedbackScores  // { p1: FeedbackScore, p2: FeedbackScore, p3: FeedbackScore }
```

En `FeedbackEntry.tsx`, después del bloque de avatar+nombre+fecha, añadir pills condicionados a `data.scores`:

```tsx
{data.scores && (
  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
    <ScorePill label="Problema" score={data.scores.p1} labelMap={{ 1: 'no', 2: 'parcialmente', 3: 'sí' }} />
    <ScorePill label="Lo usaría" score={data.scores.p2} labelMap={{ 1: 'no', 2: 'no', 3: 'sí' }} />
  </div>
)}
```

Donde `ScorePill` es un sub-componente interno (no exportado):
```typescript
function ScorePill({ label, score, labelMap }: {
  label: string
  score: FeedbackScore
  labelMap: Record<1 | 2 | 3, string>
}) {
  const colorMap: Record<FeedbackScore, { bg: string; text: string }> = {
    1: { bg: 'var(--color-weak-bg)',     text: 'var(--color-weak-text)' },
    2: { bg: 'var(--color-needs-bg)',    text: 'var(--color-needs-text)' },
    3: { bg: 'var(--color-promising-bg)', text: 'var(--color-promising-text)' },
  }
  const { bg, text } = colorMap[score]
  return (
    <span
      style={{
        fontSize: 'var(--text-xs)',
        backgroundColor: bg,
        color: text,
        borderRadius: 'var(--radius-full)',
        padding: '2px var(--space-2)',
        fontWeight: 'var(--font-medium)',
      }}
    >
      {label}: {labelMap[score]}
    </span>
  )
}
```

> Los tokens `var(--color-weak-bg)`, `var(--color-needs-bg)`, `var(--color-promising-bg)` deben existir en design-tokens. Verificar en `docs/project/design-tokens.md`. Si no existen como `*-bg`, usar los `*-text` con `opacity: 0.1` o un background derivado.

---

### FeedbackCTA y FeedbackFormInline: ¿coexisten?

Actualmente `FeedbackCTA` aparece en la columna principal cuando `project.status === 'live'` y variante `authenticated-member`. Con esta story, el reviewer ve `FeedbackFormInline` en la sidebar.

Decisión de producto implícita en el epic: el formulario inline EN la sidebar REEMPLAZA a `FeedbackCTA` para reviewers en proyectos live. Homer debe eliminar el `{project.status === 'live' && <FeedbackCTA ...>}` de la columna principal cuando el usuario NO es owner (ya que el formulario está en la sidebar). Para el owner, `FeedbackCTA` retorna `null` (variante `owner`), por lo que no hay impacto.

Lógica propuesta:
```tsx
{/* FeedbackCTA solo si no hay sidebar inline (owner o draft) */}
{project.status === 'live' && isOwner && (
  <FeedbackCTA variant="owner" ... />
  // retorna null igualmente — se puede eliminar esta llamada
)}
```

Alternativa más limpia: eliminar `FeedbackCTA` de la columna principal completamente en esta story, ya que el owner ve `null` y el reviewer tiene `FeedbackFormInline` en sidebar.

---

### Test impact: tests existentes que pueden romper

#### `tests/unit/projects/ProjectDetailSections.test.tsx`

Los tests existentes cubren `ProjectDetailFeaturedImage`, `ProjectDetailTargetUser`, `ProjectDetailDemo`, `ProjectDetailFeedbackTopics`, `ProjectDetailAuthor`. No testean directamente `page.tsx` (Server Component). Los tests NO deberían romperse salvo que se modifique alguno de esos componentes.

Si se añade caption directamente en `page.tsx` (Opción A), no hay tests que romper. Si se añade como prop en `ProjectDetailFeaturedImage`, hay que actualizar los tests existentes de ese componente (no rompería, sería añadir tests nuevos).

#### `tests/unit/proof-score/` (si existe)

Buscar con Glob antes de implementar para verificar qué tests existen para `ValidationSignalCard` y `ProofScoreSidebar`.

#### Tests de `FeedbackEntry` y `TeamPerspectives`

Si existen tests que mockean `FeedbackEntryData`, añadir `scores` como campo opcional no rompe nada (es `?:` en el type).

---

### Tests nuevos a escribir (TDD Outside-In)

#### `tests/unit/feedback/FeedbackFormInline.test.tsx`

```typescript
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock submitFeedback
vi.mock('@/lib/api/feedback', () => ({
  submitFeedback: vi.fn().mockResolvedValue({ id: 'fb-1' }),
}))

describe('FeedbackFormInline', () => {
  const defaultProps = {
    projectId: 'proj-uuid',
    communityId: 'comm-uuid',
  }

  it('renderiza el formulario en estado inicial', () => {
    render(<FeedbackFormInline {...defaultProps} />)
    expect(screen.getByText('¿Entiendes el problema?')).toBeInTheDocument()
    expect(screen.getByText('¿Lo usarías?')).toBeInTheDocument()
    expect(screen.getByTestId('feedback-form-inline-submit')).toBeDisabled()
  })

  it('habilita el submit cuando todos los campos son válidos', async () => {
    render(<FeedbackFormInline {...defaultProps} />)
    // seleccionar p1=Sí, p2=Sí, escribir >10 chars en textarea
    // ...fireEvent clicks
    expect(screen.getByTestId('feedback-form-inline-submit')).not.toBeDisabled()
  })

  it('muestra confirmación tras envío exitoso', async () => {
    render(<FeedbackFormInline {...defaultProps} />)
    // ... completar form y submit
    await waitFor(() => {
      expect(screen.getByTestId('feedback-form-inline-confirmation')).toBeInTheDocument()
    })
  })

  it('muestra error cuando submitFeedback falla', async () => {
    vi.mocked(submitFeedback).mockRejectedValueOnce(new Error('Ya diste feedback'))
    render(<FeedbackFormInline {...defaultProps} />)
    // ... completar form y submit
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Ya diste feedback')
    })
  })

  it('deshabilita el botón mientras carga', async () => {
    // mock con delay
    render(<FeedbackFormInline {...defaultProps} />)
    // ... completar form y click submit
    expect(screen.getByTestId('feedback-form-inline-submit')).toBeDisabled()
  })
})
```

#### `tests/unit/proof-score/ValidationSignalCard.test.tsx`

```typescript
describe('ValidationSignalCard', () => {
  it('muestra dos barras de progreso cuando hay feedbacks', () => {
    render(<ValidationSignalCard understandPercent={70} wouldUsePercent={45} feedbackCount={5} />)
    expect(screen.getByLabelText('Comprenden el problema')).toBeInTheDocument()
    expect(screen.getByLabelText('Lo usarían')).toBeInTheDocument()
    expect(screen.getByText('Basado en 5 feedbacks')).toBeInTheDocument()
  })

  it('muestra estado sin datos cuando feedbackCount es 0', () => {
    render(<ValidationSignalCard understandPercent={0} wouldUsePercent={0} feedbackCount={0} />)
    expect(screen.getByText(/aún no hay datos/i)).toBeInTheDocument()
  })

  it('muestra el disclaimer en itálica', () => {
    render(<ValidationSignalCard understandPercent={60} wouldUsePercent={40} feedbackCount={3} />)
    expect(screen.getByText(/esta señal se actualiza/i)).toBeInTheDocument()
  })
})
```

---

### Design tokens en uso

Todos los inline styles deben usar tokens de `docs/project/design-tokens.md`:
- `var(--text-xs)`, `var(--text-sm)`, `var(--text-base)`, `var(--text-lg)`
- `var(--color-text-primary)`, `var(--color-text-secondary)`, `var(--color-text-muted)`
- `var(--color-surface)`, `var(--color-background)`, `var(--color-border)`
- `var(--color-primary)` — botón naranja "Compartir insight"
- `var(--color-weak-text)`, `var(--color-weak-bg)` — pill "No"
- `var(--color-needs-text)`, `var(--color-needs-bg)` — pill "Parcialmente"
- `var(--color-promising-text)`, `var(--color-promising-bg)` — pill "Sí"
- `var(--font-semibold)`, `var(--font-medium)`
- `var(--space-1)` hasta `var(--space-8)`
- `var(--radius-full)`, `var(--radius-md)`, `var(--radius-lg)`
- `var(--leading-base)`

> Verificar `var(--color-*-bg)` tokens (promising-bg, needs-bg, weak-bg) en `docs/project/design-tokens.md` antes de usarlos. Si no están definidos, crear la derivación con opacidad o consultar con el sistema actual.

---

### Dependencias de la story

- **Story 9.1** — `tagline` existe en tabla `projects` ✓
- **Migration 012** — RLS `member_read_community_feedbacks` garantiza acceso a feedbacks para todos los miembros ✓
- **`submitFeedback` en `lib/api/feedback.ts`** — reutilizable directamente ✓
- **`SignalIndicator` y `ProgressBar`** en `components/shared/` — reutilizables ✓
- **`ValidationSignalCard`** — existe en `components/proof-score/` pero requiere refactor de props
- **`ProofScoreSidebar`** — usa `ValidationSignalCard` con las props actuales; hay que actualizar tras el refactor
- **`FeedbackFormInline`** — componente nuevo, no existe actualmente ✓
- **`scores` en feedbacks** — campo existe en DB (migration 4-2), pero `findByProject` no lo selecciona actualmente

### Git context (últimos commits)

```
cdf8e11 feat(navbar): añadir logo, nombre de usuario e icono logout — Story 9.5
875e8e1 feat(landing): welcome screen — Story 9.4
fa63715 fix(test): actualizar assertion href de /auth/login a /login en FeedbackCTA
b78520c fix(auth): reemplazar todas las rutas /auth/login por /login
f2f74fa feat(auth): login page visual redesign — Story 9.2
3bdcfb1 feat(db): tagline + would_use_count en projects — Story 9.1
```

Patrón de commits: `feat(scope): descripción — Story X.Y (#PR)`
Rama: `feat/9-7-project-detail-tagline-sidebar-universal-feedback-inline` desde `main`

### Issue conocido del CR 9.6 relevante para esta story

**CR9-6-M1 [MEDIUM]:** `findByProject` en `feedback.repository.ts` NO necesita incluir tagline/wouldUseCount (esos son de projects), pero SÍ necesita incluir `scores` (campo de feedbacks). T4 resuelve esta necesidad.

### Flow recomendado

Full Flow (Homer) por la complejidad: refactor de ValidationSignalCard con cambio de props, nuevo componente FeedbackFormInline client-side, lógica de sidebar condicional por rol+status, pills en FeedbackEntry, actualización en cascada de ProofScoreSidebar.

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6 (Homer — Full Flow)

### File List

- `app/(app)/communities/[slug]/projects/[id]/page.tsx`
- `components/proof-score/ValidationSignalCard.tsx`
- `components/proof-score/ProofScoreSidebar.tsx`
- `components/feedback/FeedbackFormInline.tsx` (nuevo)
- `components/feedback/FeedbackEntry.tsx`
- `lib/repositories/feedback.repository.ts`
- `lib/types/feedback.ts`
- `stories/feedback/FeedbackFormInline.stories.tsx` (nuevo)
- `stories/proof-score/ValidationSignalCard.stories.tsx`
- `tests/unit/feedback/FeedbackFormInline.test.tsx` (nuevo)
- `tests/unit/proof-score/ValidationSignalCard.test.tsx` (nuevo)
- `tests/unit/feedback/FeedbackEntry.test.tsx` (actualizado)
- `docs/project/modules/projects.md`
- `docs/project/modules/feedback.md`
- `_bmad-output/execution-log.yaml`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Implementation Notes

**T1 — page.tsx:** SELECT extendido con `tagline`. `showSidebar` flag reemplaza el guard `isOwner`. Caption de imagen (Opción A: directamente en page.tsx tras `ProjectDetailFeaturedImage`). Heading hipótesis actualizado. FeedbackCTA eliminado de columna principal para reviewers. Mapping de feedbackEntries incluye `scores`. Función `calculateValidationMetrics` pura para derivar understandPercent/wouldUsePercent desde feedbacks SSR.

**T2 — FeedbackFormInline:** Componente 'use client' con sub-componente interno `ScoreSelector`. Tres preguntas: p1 (3 opciones), p2 (2 opciones), textarea. P3 enviado como 2 (neutral). Estados idle/loading/success/error. Confirmación con `data-testid="feedback-form-inline-confirmation"`. Error con `role="alert"`.

**T3 — ValidationSignalCard:** Props completamente reemplazadas: `score: ProofScoreResult` → `{ understandPercent, wouldUsePercent, feedbackCount }`. Semáforo derivado internamente de `understandPercent` (≥70 Promising, ≥40 Needs, <40 Weak). Dos barras separadas. Estado sin datos cuando feedbackCount=0. ProofScoreSidebar adaptado con función `derivePercentsFromScore` que mapea `score.average` a ambas barras.

**T4/T5 — Tipos y repo:** `findByProject` añade `scores` al select. `FeedbackEntryData` añade `scores?: FeedbackScores` (opcional — retrocompatible).

**T6 — FeedbackEntry:** Sub-componente interno `ScorePill` con mapa de colores semáforo. Pills condicionadas a presencia de `data.scores`. p2=2 mapea a "no" por decisión de producto.

**T8 — Tests:** 12 tests nuevos en FeedbackFormInline (mock con `vi.mock` factory pattern para resolver hoisting). 7 tests nuevos en FeedbackEntry (pills). 9 tests reescritos en ValidationSignalCard (props refactorizadas). Total: 383 tests (≥370 ✓).

### Completion Notes

Story 9.7 completa. Todos los ACs satisfechos:
- AC-1: tagline, caption imagen, heading "🔬 Hipótesis a validar"
- AC-2: sidebar visible para reviewer en live con ValidationSignalCard + FeedbackFormInline
- AC-3: sidebar visible para todos en inactive con mensaje de cierre
- AC-4: sidebar owner con bloque "Feedback recibido" + ValidationSignalCard + ProofScoreSidebar (sin FeedbackFormInline)
- AC-5: pills en FeedbackEntry con paleta semáforo
- AC-6: Storybook con stories de ValidationSignalCard (Promising, NeedsIteration, Weak, SinDatos) y FeedbackFormInline (EstadoInicial, Cargando, Confirmacion)
- AC-7: 383 tests verdes (≥370 ✓), lint verde, tsc verde
