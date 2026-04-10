# Story 8.8: ValidationSignalCard + Storybook

Status: dev-complete

## Story

Como builder autenticado,
quiero ver un card de validación con indicador visual, barras de progreso por dimensión y disclaimer,
para entender de un vistazo la señal de mi proyecto y qué dimensiones necesito mejorar.

## Acceptance Criteria

1. `ValidationSignalCard` existe en `components/proof-score/ValidationSignalCard.tsx` y es un componente presentacional puro — sin `'use client'`, sin fetch, sin estado interno.
2. El componente acepta `score: ProofScoreResult` como prop y deriva `level` a partir de `label` (`Promising` → `promising`, `Needs iteration` → `needs-work`, `Weak` → `weak`).
3. El componente renderiza `SignalIndicator` con el `level` y `label` derivados del score.
4. El componente renderiza al menos una `ProgressBar` por dimensión del score. Si `ProofScoreResult` no tiene dimensiones en la fecha de implementación, se renderiza una única `ProgressBar` con `label="Puntuación media"` y `percentage={score.average}`.
5. El componente renderiza un texto de disclaimer debajo de las barras (texto exacto: `"Basado en {score.feedbackCount} respuestas"`).
6. `ProofScoreSidebar` usa `ValidationSignalCard` en lugar de renderizar `ProofScoreBadge` directamente — eliminando la dependencia directa de `ProofScoreBadge` desde el sidebar.
7. Existe `stories/proof-score/ValidationSignalCard.stories.tsx` con 3 exports nombrados: `Promising`, `NeedsIteration`, `Weak`, cada uno con datos mock completos.
8. El componente no usa valores hardcoded de color — usa exclusivamente design tokens CSS (`var(--color-*)`, `var(--space-*)`, etc.).
9. Existe al menos un test unitario en `__tests__/proof-score/ValidationSignalCard.test.tsx` que verifica el renderizado de `SignalIndicator` y `ProgressBar` para las 3 variantes.
10. El test E2E (si aplica) se crea con `.skip` siguiendo la convención TDD Outside-In del proyecto.

## Tasks / Subtasks

- [x] Task 1 — Test E2E (AC: #10)
  - [x] Crear `tests/e2e/proof-score/ValidationSignalCard.spec.ts` con `test.skip` para las 3 variantes

- [x] Task 2 — Tests unitarios (AC: #9)
  - [x] Crear `tests/unit/proof-score/ValidationSignalCard.test.tsx`
  - [x] Test: renderiza `SignalIndicator` con level `promising` cuando label es `Promising`
  - [x] Test: renderiza `SignalIndicator` con level `needs-work` cuando label es `Needs iteration`
  - [x] Test: renderiza `SignalIndicator` con level `weak` cuando label es `Weak`
  - [x] Test: renderiza `ProgressBar` con `percentage={score.average}` y label correcto
  - [x] Test: renderiza disclaimer con feedbackCount interpolado

- [x] Task 3 — Implementar `ValidationSignalCard` (AC: #1, #2, #3, #4, #5, #8)
  - [x] Crear `components/proof-score/ValidationSignalCard.tsx`
  - [x] Sin `'use client'` — RSC puro
  - [x] Definir `LABEL_TO_LEVEL` map: `Promising→promising`, `Needs iteration→needs-work`, `Weak→weak`
  - [x] Renderizar `SignalIndicator` con level y label derivados
  - [x] Renderizar `ProgressBar` con `label="Puntuación media"` y `percentage={score.average}`
  - [x] Renderizar disclaimer `<p>Basado en {score.feedbackCount} respuestas</p>`
  - [x] Usar solo design tokens CSS — sin valores hardcoded

- [x] Task 4 — Refactorizar `ProofScoreSidebar` (AC: #6)
  - [x] En `components/proof-score/ProofScoreSidebar.tsx`, reemplazar `<ProofScoreBadge label={score.label} variant="full" />` por `<ValidationSignalCard score={score} />`
  - [x] Eliminar import de `ProofScoreBadge` — ya no se usa en este fichero
  - [x] `ProofScoreBadge` NO se elimina — sigue existiendo y siendo usado en otros contextos (ej. listas de proyectos)

- [x] Task 5 — Storybook story (AC: #7)
  - [x] Crear `stories/proof-score/ValidationSignalCard.stories.tsx`
  - [x] Meta: `title: 'proof-score/ValidationSignalCard'`, `layout: 'padded'`, `tags: ['autodocs']`
  - [x] Export `Promising`: `{ label: 'Promising', average: 78, feedbackCount: 12 }`
  - [x] Export `NeedsIteration`: `{ label: 'Needs iteration', average: 45, feedbackCount: 7 }`
  - [x] Export `Weak`: `{ label: 'Weak', average: 22, feedbackCount: 3 }`

## Dev Notes

### Arquitectura del componente

`ValidationSignalCard` es un **Server Component presentacional puro**:
- NO `'use client'`
- NO fetch interno
- NO estado (`useState`, `useEffect`)
- Recibe `score: ProofScoreResult` como prop única
- Deriva `SignalLevel` desde `ProofScoreLabel` via mapa constante

Firma de props esperada:
```typescript
interface ValidationSignalCardProps {
  score: ProofScoreResult
}
```

Mapa de derivación (definir como constante fuera del componente):
```typescript
const LABEL_TO_LEVEL: Record<ProofScoreLabel, SignalLevel> = {
  'Promising': 'promising',
  'Needs iteration': 'needs-work',
  'Weak': 'weak',
}
```

`SignalLevel` viene de `SignalIndicator.tsx` — actualmente es un tipo local. Si es necesario exportarlo para usarlo en `ValidationSignalCard`, hacerlo desde `SignalIndicator.tsx` (exportar el tipo, no duplicarlo).

### Tipos existentes

- `ProofScoreLabel` = `'Promising' | 'Needs iteration' | 'Weak'` — `lib/types/proof-score.ts`
- `ProofScoreResult` = `{ label: ProofScoreLabel; average: number; feedbackCount: number }` — `lib/types/proof-score.ts`
- `ProjectDecision` = `'iterate' | 'scale' | 'abandon'` — `lib/types/projects.ts` (no aplica a esta story)

**ATENCIÓN — `ProofScoreResult` no tiene dimensiones:** La interfaz actual solo expone `average` y `feedbackCount`. No crear una interfaz nueva ni ampliar el tipo en esta story. Renderizar una única `ProgressBar` con `label="Puntuación media"` y `percentage={score.average}`.

### Componentes a reutilizar (NO reinventar)

| Componente | Path | Props relevantes |
|---|---|---|
| `SignalIndicator` | `components/shared/SignalIndicator.tsx` | `level: 'promising' \| 'needs-work' \| 'weak'`, `label: string` |
| `ProgressBar` | `components/shared/ProgressBar.tsx` | `label: string`, `percentage: number`, `color?: string` |
| `ProofScoreBadge` | `components/proof-score/ProofScoreBadge.tsx` | Se MANTIENE — no eliminar. Solo se mueve su uso en `ProofScoreSidebar`. |

### Design tokens a usar

Colores semánticos Proof Score (ya en `app/globals.css`):
- `--color-promising-text`, `--color-promising-bg`
- `--color-needs-text`, `--color-needs-bg`
- `--color-weak-text`, `--color-weak-bg`
- `--color-text-secondary` — para el disclaimer
- `--color-text-muted` — para texto auxiliar

Espaciado: `--space-1` (4px) … `--space-6` (24px).
Tipografía: `--text-xs`, `--text-sm`, `--text-base`.

### Refactor de `ProofScoreSidebar`

Cambio mínimo requerido — solo sustituir el componente renderizado:

```
// Antes
<ProofScoreBadge label={score.label} variant="full" />

// Después
<ValidationSignalCard score={score} />
```

El resto de `ProofScoreSidebar` (fetch, estado, `DecisionBadge`, `DecisionDialog`) **no se modifica**.

### Patrón Storybook del proyecto

Referencia: `stories/proof-score/ProofScoreBadge.stories.tsx` y `stories/shared/SignalIndicator.stories.tsx`.

Convenciones observadas:
- Import: `import type { Meta, StoryObj } from '@storybook/react'`
- `tags: ['autodocs']`
- `parameters: { layout: 'padded' }` para cards
- Exports nombrados en PascalCase

### TDD Outside-In

1. Crear primero test E2E con `test.skip` (sin framework E2E activo detectado — seguir patrón del proyecto si existe `e2e/` o crear el fichero como placeholder)
2. Crear tests unitarios en `__tests__/proof-score/ValidationSignalCard.test.tsx` — que fallen (red)
3. Implementar el componente hasta que pasen (green)
4. Refactorizar si procede

Framework de tests: revisar `package.json` para confirmar (Vitest o Jest). Los tests de este proyecto usan `@testing-library/react`.

### Project Structure Notes

- Componente nuevo: `components/proof-score/ValidationSignalCard.tsx` — consistente con los demás en este directorio
- Tests: `__tests__/proof-score/ValidationSignalCard.test.tsx` — no existe el directorio `__tests__/proof-score/`, crearlo
- Storybook: `stories/proof-score/ValidationSignalCard.stories.tsx` — consistente con `ProofScoreBadge.stories.tsx`
- NO crear barrel (`index.ts`) — el proyecto no sigue ese patrón para estos componentes

### Referencias

- `components/proof-score/ProofScoreBadge.tsx` — patrón de `SCORE_CONFIG` y uso de design tokens
- `components/proof-score/ProofScoreSidebar.tsx` — componente a refactorizar (línea 54: render de `ProofScoreBadge`)
- `components/shared/SignalIndicator.tsx` — `SignalLevel` type, props interface
- `components/shared/ProgressBar.tsx` — props interface, uso de `clampPercentage`
- `lib/types/proof-score.ts` — `ProofScoreLabel`, `ProofScoreResult`
- `stories/proof-score/ProofScoreBadge.stories.tsx` — patrón Storybook del módulo
- `stories/shared/SignalIndicator.stories.tsx` — patrón Storybook shared
- `docs/project/design-tokens.md` — tokens CSS completos

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `SignalLevel` exportado desde `components/shared/SignalIndicator.tsx` (era tipo local) — necesario para que `ValidationSignalCard` lo importe sin duplicarlo.
- Tests ubicados en `tests/unit/proof-score/` (no `__tests__/`) — vitest.config.ts solo incluye `tests/unit/**`.
- E2E en `tests/e2e/proof-score/ValidationSignalCard.spec.ts` con `test.skip` — sin datos seed de proof score.
- 10 tests unitarios nuevos + 303 total sin regresiones. TypeScript sin errores.

### File List

- `components/proof-score/ValidationSignalCard.tsx` — creado (RSC puro, LABEL_TO_LEVEL map, SignalIndicator + ProgressBar + disclaimer)
- `components/proof-score/ProofScoreSidebar.tsx` — modificado (sustituido ProofScoreBadge por ValidationSignalCard)
- `components/shared/SignalIndicator.tsx` — modificado (exportado tipo SignalLevel)
- `tests/unit/proof-score/ValidationSignalCard.test.tsx` — creado (10 tests unitarios)
- `tests/e2e/proof-score/ValidationSignalCard.spec.ts` — creado (3 tests E2E con test.skip)
- `stories/proof-score/ValidationSignalCard.stories.tsx` — creado (3 exports: Promising, NeedsIteration, Weak)
- `_bmad-output/implementation-artifacts/story-8-8-validationsignalcard.md` — actualizado (status + tasks)
