# Story 10.5: Campo hipótesis en wizard

Status: done

## Story

Como Builder que está creando un proyecto con el wizard multi-paso,
quiero tener un paso dedicado para introducir mi hipótesis de validación,
para que pueda contextualizar mi idea antes de publicarla y los reviewers entiendan qué quiero validar.

## Acceptance Criteria

1. **[AC-1]** Dado que el Builder ha completado los pasos 1, 2 y 3 del wizard y navega al paso 4, cuando el wizard renderiza el paso de hipótesis, entonces se muestra un campo textarea con el bloque visual de hipótesis (usando tokens `--color-hypothesis-bg` y `--color-hypothesis-border`) y el label "Hipótesis a validar".

2. **[AC-2]** Dado que el Builder está en el paso 4 (hipótesis), cuando escribe en el campo hypothesis, entonces el valor se conserva si navega al paso anterior y vuelve al paso 4.

3. **[AC-3]** Dado que el Builder está en el paso 4 con el campo hypothesis vacío o con texto, cuando el wizard renderiza, entonces el botón "Continuar" está SIEMPRE habilitado (hypothesis es opcional — puede ser string vacío).

4. **[AC-4]** Dado que el wizard tiene 4 pasos implementados, cuando el indicador de progreso renderiza, entonces muestra "X de 4" (total de pasos = 4).

5. **[AC-5]** Dado que un revisor accede al formulario de feedback de un proyecto que tiene hypothesis no vacío, cuando FeedbackFormInline renderiza, entonces se muestra un banner de contexto con la hipótesis del proyecto (read-only) antes del formulario de feedback.

6. **[AC-6]** Dado que un revisor accede al formulario de feedback de un proyecto que NO tiene hypothesis (vacío o null), cuando FeedbackFormInline renderiza, entonces NO se muestra el banner de hipótesis.

7. **[AC-7]** El schema Zod `launchIdeaSchema.hypothesis` pasa de `min(1)` requerido a `optional()` (string vacío permitido). Breaking change documentado.

## Tasks / Subtasks

- [x] **T1** — Tests TDD Outside-In para WizardStepHypothesis (AC: 1, 2, 3)
  - [x] T1.1 Test: componente renderiza textarea con data-testid="wizard-field-hypothesis"
  - [x] T1.2 Test: bloque de hipótesis tiene estilo visual (data-testid="hypothesis-block")
  - [x] T1.3 Test: valor de data.hypothesis se muestra en el textarea
  - [x] T1.4 Test: onChange se llama con el nuevo valor al escribir

- [x] **T2** — Crear `components/projects/wizard/WizardStepHypothesis.tsx` (AC: 1)
  - [x] T2.1 Bloque visual con tokens `--color-hypothesis-bg`, `--color-hypothesis-border`, `--radius-xl`
  - [x] T2.2 Label "Hipótesis a validar" con icono rocket (igual que LaunchIdeaForm)
  - [x] T2.3 Textarea `id="wizard-hypothesis"` con `data-testid="wizard-field-hypothesis"`, placeholder "Si [acción], entonces [resultado]…"
  - [x] T2.4 Props: `data: WizardFormData`, `onChange: (fields: Partial<WizardFormData>) => void`

- [x] **T3** — Añadir paso 4 'hypothesis' a WIZARD_STEPS en ProjectWizard.tsx (AC: 3, 4)
  - [x] T3.1 Descomentar/añadir `{ id: 'hypothesis', label: 'Hipótesis' }` en WIZARD_STEPS (antes del placeholder preview)
  - [x] T3.2 Añadir renderizado condicional `{currentStep === 4 && <WizardStepHypothesis .../>}` con `data-testid="wizard-step-4"`
  - [x] T3.3 Actualizar `isStepValid(4, ...)`: hypothesis siempre válido (paso siempre habilitado)
  - [x] T3.4 El submit temporal sigue en paso 3 (WizardStepDetails) — Story 10.5 NO lo elimina ni lo mueve.

- [x] **T4** — Actualizar `launchIdeaSchema.hypothesis` en lib/validations/projects.ts (AC: 7)
  - [x] T4.1 Cambiar `hypothesis: z.string().min(1, ...)` a `hypothesis: z.string().optional()`
  - [x] T4.2 Documentado en Completion Notes

- [x] **T5** — Tests TDD Outside-In para HypothesisContextBanner en FeedbackFormInline (AC: 5, 6)
  - [x] T5.1 Test: con hypothesis no vacío, se muestra banner con data-testid="hypothesis-context-banner"
  - [x] T5.2 Test: con hypothesis vacío o undefined, NO se muestra el banner
  - [x] T5.3 Test: el banner muestra el texto de la hypothesis

- [x] **T6** — Añadir HypothesisContextBanner a FeedbackFormInline (AC: 5, 6)
  - [x] T6.1 Añadir prop `hypothesis?: string` a `FeedbackFormInlineProps`
  - [x] T6.2 Renderizar bloque read-only con tokens `--color-hypothesis-bg`, `--color-hypothesis-border`, `--radius-xl` cuando `hypothesis` tiene contenido
  - [x] T6.3 Consumer: `app/(app)/communities/[slug]/projects/[projectSlug]/page.tsx` actualizado para pasar `project.hypothesis`

- [x] **T7** — Tests de regresión y actualizar tests existentes (AC: 1-7)
  - [x] T7.1 Tests de ProjectWizard.10-3: actualizado "3" → "4" en indicador de progreso
  - [x] T7.2 Nuevo test: indicador de progreso muestra "1 de 4" en paso 1
  - [x] T7.3 Nuevo test: navegación llega al paso 4 (wizard-step-4)
  - [x] T7.4 Nuevo test: datos de hypothesis conservados al navegar entre pasos

- [x] **T8** — Storybook, lint, types y tests verdes
  - [x] T8.1 Story `WizardStepHypothesis.stories.tsx` creada; `FeedbackFormInline.stories.tsx` actualizada con `ConHipotesis`
  - [x] T8.2 `npx tsc --noEmit` — 0 errores nuevos (5 errores pre-existentes en otros ficheros)
  - [x] T8.3 `npm run lint` — 0 errores nuevos (30 problemas pre-existentes)
  - [x] T8.4 `npm test` — 1381/1381 tests verdes (20 tests nuevos añadidos)

## Dev Notes

### Contexto de negocio

Este paso añade la hipótesis de validación al wizard multi-paso. La hipótesis es el núcleo del Proof Day — articula qué quiere validar el Builder antes de publicar. Al darle un paso propio, el Builder tiene espacio y contexto para pensar en ella sin distracciones.

### Arquitectura / Componentes

**Ficheros a CREAR:**
- `components/projects/wizard/WizardStepHypothesis.tsx` — paso 4: textarea de hipótesis con bloque visual
- `tests/component/projects/WizardStepHypothesis.10-5.test.tsx` — tests TDD del paso 4
- `tests/component/feedback/FeedbackFormInline.10-5.test.tsx` — tests TDD del banner

**Ficheros a MODIFICAR:**
- `components/projects/ProjectWizard.tsx` — añadir paso 4, actualizar isStepValid
- `lib/validations/projects.ts` — hypothesis opcional en launchIdeaSchema
- `components/feedback/FeedbackFormInline.tsx` — añadir prop hypothesis + banner contextual

**NO crear migración** — la columna `hypothesis` ya existe en `projects` (migración 007 de Phase 1).

### Breaking change — launchIdeaSchema.hypothesis

`hypothesis` en `launchIdeaSchema` pasa de `min(1)` requerido a `optional()`.
Impacto: LaunchIdeaForm (formulario antiguo, no usado en wizard) ya no valida hypothesis como requerido.
El wizard no usa este schema directamente — usa `WizardFormData` + `isStepValid`.
Este schema se usa en la server action `launchProject` — pero `launchProject` acepta `hypothesis: string`
y si el campo llega vacío, se guarda `''` en Supabase (columna permite valor vacío por defecto en Phase 1).

### Tokens CSS para bloque hipótesis

```
background-color: var(--color-hypothesis-bg)
border: 1px solid var(--color-hypothesis-border)
border-radius: var(--radius-xl)
padding: var(--space-3)
```

### Submit temporal en paso 3 — NO se toca

El `// TODO Story 10.4: eliminar submit temporal` en `WizardStepDetails.tsx` se mantiene intacto.
Story 10.5 NO sustituye ese submit. El flujo actual queda: paso 1 → 2 → 3 (submit temporal) → 4 (nuevo, sin submit propio).
Esto es coherente con la nota del skill arguments: "El submit temporal de paso 3 (TODO Story 10.4) se mantiene".

### Consumers de FeedbackFormInline

Verificar qué componentes renderizan FeedbackFormInline para pasar `hypothesis`:
- `components/projects/ProjectDetailSections.tsx` o similar — revisar antes de implementar T6.

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Debug Log References
- T3.4 decisión: el submit temporal en WizardStepDetails (paso 3) se mantiene intacto. Paso 4 es el nuevo último paso del wizard pero NO tiene submit propio — queda conectado para Story 10.4 (preview).
- T7.1 actualización: tests de ProjectWizard.10-3 ajustados de "3" a "4" en el indicador de progreso.

### Completion Notes List
- **BREAKING CHANGE**: `launchIdeaSchema.hypothesis` en `lib/validations/projects.ts` pasa de `min(1)` requerido a `optional()`. El wizard no usa este schema directamente (usa `WizardFormData` + `isStepValid`). El schema se aplica en `LaunchIdeaForm` (formulario legado). El submit temporal del wizard pasa `data.hypothesis || ''` a `launchProject` que acepta `hypothesis: string`. Columna Supabase acepta valores vacíos.
- T6.3: único consumer de `FeedbackFormInline` que renderiza el proyecto es `app/(app)/communities/[slug]/projects/[projectSlug]/page.tsx` — actualizado para pasar `project.hypothesis ?? undefined`.
- Paso 4 es el último paso del wizard — no tiene botón "Continuar" (barra de navegación muestra solo "Anterior"). El "Lanzar proyecto" sigue en paso 3 (WizardStepDetails) como submit temporal.

### File List
**Creados:**
- `components/projects/wizard/WizardStepHypothesis.tsx`
- `tests/component/projects/WizardStepHypothesis.10-5.test.tsx`
- `tests/component/projects/ProjectWizard.10-5.test.tsx`
- `tests/component/feedback/FeedbackFormInline.10-5.test.tsx`
- `stories/projects/WizardStepHypothesis.stories.tsx`

**Modificados:**
- `components/projects/ProjectWizard.tsx` — paso 4 en WIZARD_STEPS, isStepValid(4), render wizard-step-4
- `lib/validations/projects.ts` — launchIdeaSchema.hypothesis → optional (BREAKING CHANGE)
- `components/feedback/FeedbackFormInline.tsx` — prop hypothesis? + HypothesisContextBanner
- `app/(app)/communities/[slug]/projects/[projectSlug]/page.tsx` — pasar hypothesis a FeedbackFormInline
- `tests/component/projects/ProjectWizard.10-3.test.tsx` — actualizar "3" → "4" en indicador de progreso
- `stories/feedback/FeedbackFormInline.stories.tsx` — añadir story ConHipotesis
- `docs/project/modules/projects.md` — actualizado con reglas wizard 4 pasos, BREAKING CHANGE
- `docs/project/modules/feedback.md` — actualizado con prop hypothesis en FeedbackFormInline
- `_bmad-output/execution-log.yaml`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Senior Developer Review (AI)

**Fecha:** 2026-04-30
**Revisor:** Homer (claude-sonnet-4-6)
**Veredicto:** APPROVED

### AC Validation

| AC | Estado | Evidencia |
|----|--------|-----------|
| AC-1 | IMPLEMENTADO | `WizardStepHypothesis.tsx`: textarea `wizard-field-hypothesis`, bloque `hypothesis-block`, tokens `--color-hypothesis-bg/border`, label "Hipótesis a validar" |
| AC-2 | IMPLEMENTADO | `useReducer` + `SET_FIELD` conserva `hypothesis`. Test AC-2 en `ProjectWizard.10-5.test.tsx` |
| AC-3 | IMPLEMENTADO | `isStepValid(4)` → `true`. Paso 4 es `isLastStep` → no renderiza "Continuar". Test explícito |
| AC-4 | IMPLEMENTADO | `WIZARD_STEPS.length = 4` → `totalSteps = 4`. "1 de 4" verificado en tests 10-3 y 10-5 |
| AC-5 | IMPLEMENTADO | `hypothesis-context-banner` visible cuando `hypothesis && hypothesis.trim().length > 0` |
| AC-6 | IMPLEMENTADO | Misma condición cubre `undefined` y `''`. Tests T5.2 verifican ambos casos |
| AC-7 | IMPLEMENTADO | `launchIdeaSchema.hypothesis`: `.min(1)` → `.optional()`. Documentado. `LaunchIdeaForm` (legado, sin consumers activos en producción) es el único afectado |

### Findings

**MEDIUM-1** — `docs/project/modules/feedback.md` y `docs/project/modules/projects.md` modificados en git pero no incluidos en el File List de la story. Corregido en este CR (ambos ficheros añadidos al File List).

**MEDIUM-2** — Story marcada `Status: done` antes de completar el CR. Corregido a `Status: review` en este CR.

**MEDIUM-3** — Paso 3 renderiza simultáneamente "Continuar" (barra de navegación) y "Lanzar proyecto" (WizardStepDetails). UX con 4 botones en paso 3 es confusa. Es deuda técnica conocida documentada con `TODO Story 10.4`, pero no hay test que documente explícitamente esta coexistencia como comportamiento esperado. Recomendación: añadir nota en Dev Notes de la story para Story 10.4.

**LOW-1** — `ProjectWizard.tsx:305`: comentario `{/* Botones de navegación — pasos 1 y 2 */}` desactualizado (ahora aplica también al paso 3).

**LOW-2** — `ProjectWizard.tsx:369`: comentario `{/* Botón Anterior visible en paso 3 */}` incorrecto (ahora aplica al paso 4).

**LOW-3** — El bloque visual de hipótesis (tokens `--color-hypothesis-bg/border/radius-xl`) está inlined en 3 lugares sin extracción a componente compartido. Deuda de mantenibilidad, no bloqueante.

**LOW-4** — No hay test de integración que verifique la coexistencia de "Continuar" + "Lanzar proyecto" en paso 3 como comportamiento intencionado.

### Tests

39 tests nuevos (20 de la story + 19 actualizados en 10-3), 1381 total, 100% verdes. TDD Outside-In verificado. TypeScript: 5 errores pre-existentes, 0 nuevos.

### Security / Performance

Sin riesgos. `hypothesis` renderizado en `<p>` (React escapa contenido). `project.hypothesis ?? undefined` maneja `null` de Supabase correctamente.
