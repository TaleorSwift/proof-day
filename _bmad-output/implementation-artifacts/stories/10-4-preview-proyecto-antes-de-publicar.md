# Story 10.4: Preview del proyecto antes de publicar

Status: in-progress

## Story

Como Builder que está completando el wizard de creación de proyecto,
quiero ver un paso de vista previa read-only que muestre cómo verán los Reviewers mi proyecto,
para que pueda revisar el contenido antes de publicarlo definitivamente.

## Acceptance Criteria

1. **[AC-1]** Dado que el Builder llega al paso 5 del wizard (preview), cuando el componente `ProjectPreview` renderiza, entonces se muestra un banner con el texto "Así verán tu proyecto los Reviewers" con `backgroundColor: var(--color-hypothesis-bg)` y `border: 1px solid var(--color-hypothesis-border)`.

2. **[AC-2]** Dado que el Builder está en el paso de preview, cuando el componente renderiza, entonces se muestran en modo read-only: el tipo de proyecto como pill (si hay `templateName`), el título, el tagline, el problema, la solución, y la hipótesis (solo si no está vacía).

3. **[AC-3]** Dado que el Builder está en el paso de preview y la hipótesis está vacía, cuando el componente renderiza, entonces la sección de hipótesis NO se muestra.

4. **[AC-4]** Dado que el Builder hace click en el botón "Editar", cuando el handler `onEdit` se ejecuta, entonces el wizard regresa al paso anterior (paso 4 — hipótesis).

5. **[AC-5]** Dado que el Builder hace click en el botón "Publicar" con `isPublishing=false`, cuando el botón renderiza, entonces está habilitado y muestra el texto "Publicar".

6. **[AC-6]** Dado que `isPublishing=true`, cuando el botón "Publicar" renderiza, entonces está deshabilitado y muestra el texto "Publicando...".

7. **[AC-7]** Dado que el Builder llega al paso 5 del wizard, cuando `WIZARD_STEPS` renderiza el indicador de progreso, entonces muestra "5 de 5".

8. **[AC-8]** El submit temporal en `WizardStepDetails.tsx` (TODO Story 10.4) es ELIMINADO. El botón "Lanzar proyecto" del paso 3 ya no existe. La navegación del wizard ahora fluye: paso 3 → paso 4 → paso 5 (preview) → publicar.

9. **[AC-9]** Al hacer click en "Publicar", el wizard llama a `launchProject()` con los datos del form, muestra un toast de éxito y cierra el modal.

## Tasks / Subtasks

- [ ] **T1** — Crear story file y leer contexto
  - [x] T1.1 Story file creada en `_bmad-output/implementation-artifacts/stories/10-4-preview-proyecto-antes-de-publicar.md`

- [ ] **T2** — Tests TDD Outside-In para ProjectPreview (AC: 1, 2, 3, 4, 5, 6)
  - [ ] T2.1 Test: banner con `data-testid="preview-reviewer-banner"` renderiza cuando `data.title` tiene valor
  - [ ] T2.2 Test: banner contiene texto "Así verán tu proyecto los Reviewers"
  - [ ] T2.3 Test: pill de template renderiza si `templateName` está presente (data-testid="preview-template-pill")
  - [ ] T2.4 Test: pill NO renderiza si `templateName` es undefined
  - [ ] T2.5 Test: título read-only con `data-testid="preview-title"`
  - [ ] T2.6 Test: tagline read-only con `data-testid="preview-tagline"`
  - [ ] T2.7 Test: problema read-only con `data-testid="preview-problem"`
  - [ ] T2.8 Test: solución read-only con `data-testid="preview-solution"`
  - [ ] T2.9 Test: hipótesis visible con `data-testid="preview-hypothesis"` cuando hay contenido
  - [ ] T2.10 Test: hipótesis NO visible cuando `data.hypothesis` está vacío
  - [ ] T2.11 Test: botón Editar presente con `data-testid="preview-edit-btn"`, llama a `onEdit`
  - [ ] T2.12 Test: botón Publicar habilitado con texto "Publicar" cuando `isPublishing=false`
  - [ ] T2.13 Test: botón Publicar deshabilitado con texto "Publicando..." cuando `isPublishing=true`

- [ ] **T3** — Crear `components/projects/ProjectPreview.tsx` (AC: 1, 2, 3, 4, 5, 6)
  - [ ] T3.1 Banner con tokens `--color-hypothesis-bg`, `--color-hypothesis-border`, texto "Así verán tu proyecto los Reviewers"
  - [ ] T3.2 Sección tipo: pill con `templateName` si presente
  - [ ] T3.3 Sección título, tagline, problema, solución — read-only
  - [ ] T3.4 Sección hipótesis — solo si `data.hypothesis` tiene contenido
  - [ ] T3.5 Botón "Editar" → llama `onEdit()`
  - [ ] T3.6 Botón "Publicar" → disabled y texto "Publicando..." cuando `isPublishing=true`
  - [ ] T3.7 Props: `data: WizardFormData`, `templateName?: string`, `onEdit: () => void`, `onPublish: () => void`, `isPublishing?: boolean`

- [ ] **T4** — Integrar paso 5 'preview' en WIZARD_STEPS de ProjectWizard.tsx (AC: 7, 8)
  - [ ] T4.1 Descomentar `{ id: 'preview', label: 'Vista previa' }` en WIZARD_STEPS
  - [ ] T4.2 Añadir renderizado condicional `{currentStep === 5 && <ProjectPreview .../>}` con `data-testid="wizard-step-5"`
  - [ ] T4.3 Añadir `isStepValid(5, ...)` → siempre true
  - [ ] T4.4 La navegación del paso 5 es el último paso — no renderiza "Continuar"

- [ ] **T5** — Eliminar submit temporal de WizardStepDetails.tsx (AC: 8)
  - [ ] T5.1 Eliminar el bloque `{/* Submit temporal — deuda técnica */}` completo (div + button "Lanzar proyecto")
  - [ ] T5.2 Eliminar prop `onSubmit: () => void` de la interfaz `Props` de WizardStepDetails
  - [ ] T5.3 Eliminar la llamada `onSubmit={handleSubmit}` en ProjectWizard.tsx

- [ ] **T6** — Conectar ProjectPreview con launchProject en LaunchIdeaModal (AC: 9)
  - [ ] T6.1 Mover la lógica de submit de `handleWizardSubmit` a un handler `handlePublish` en LaunchIdeaModal
  - [ ] T6.2 El wizard pasa `onPublish` a ProjectPreview vía prop del ProjectWizard
  - [ ] T6.3 Eliminar el TODO Story 10.4 de LaunchIdeaModal

- [ ] **T7** — Tests de regresión y actualización (AC: 7, 8)
  - [ ] T7.1 Tests de ProjectWizard.10-3 y 10-5: actualizar "4" → "5" en indicador de progreso
  - [ ] T7.2 Tests de WizardStepDetails.10-3: actualizar para reflejar que no tiene submit
  - [ ] T7.3 Tests de LaunchIdeaModal.10-3: actualizar para el nuevo flujo
  - [ ] T7.4 Nuevo test: navegación llega al paso 5 (wizard-step-5)
  - [ ] T7.5 Nuevo test: indicador de progreso muestra "1 de 5" en paso 1

- [ ] **T8** — Storybook, lint, types y tests verdes
  - [ ] T8.1 Story `ProjectPreview.stories.tsx` creada
  - [ ] T8.2 `npx tsc --noEmit` — 0 errores nuevos
  - [ ] T8.3 `npm run lint` — 0 errores nuevos
  - [ ] T8.4 `npm test` — 100% tests verdes

## Dev Notes

### Contexto de negocio

El paso 5 es la puerta de publicación del wizard. Muestra al Builder cómo verán su proyecto los Reviewers antes de publicarlo. El Builder puede corregir si algo no está bien. Este paso elimina la fricción de publicar a ciegas y aumenta la calidad del contenido publicado.

### Arquitectura / Componentes

**Ficheros a CREAR:**
- `components/projects/ProjectPreview.tsx` — vista read-only del proyecto con banner + secciones
- `tests/component/projects/ProjectPreview.10-4.test.tsx` — tests TDD

**Ficheros a MODIFICAR:**
- `components/projects/ProjectWizard.tsx` — añadir paso 5, isStepValid(5), render wizard-step-5, eliminar `onSubmit` prop pasado a WizardStepDetails
- `components/projects/wizard/WizardStepDetails.tsx` — eliminar submit temporal + prop `onSubmit`
- `components/projects/LaunchIdeaModal.tsx` — pasar `onPublish` al wizard, eliminar TODOs
- `stories/projects/ProjectPreview.stories.tsx` — nueva story Storybook

### Estrategia de publicación

`launchProject()` server action ya crea el proyecto con `status='live'` directamente.
No se necesita Story 11.5 (PATCH status). El flujo es: preview → click "Publicar" → `launchProject()` → toast → cerrar modal.

**Deuda técnica documentada:** Story 11.5 (PATCH /api/projects/[id]/status) podría permitir un flujo draft→live en el futuro, pero no es necesaria para esta story.

### Props de ProjectWizard — extensión

Se añade `onPublish` prop al ProjectWizard para que el componente orquestador (LaunchIdeaModal) controle el submit final:

```typescript
interface Props {
  templates: ProjectTemplate[]
  onSubmit: (data: WizardFormData) => void  // Se mantiene para compatibilidad pero no se usa en paso 5
  onPublish?: (data: WizardFormData) => void  // Nuevo: callback de publicación desde paso 5
  onCancel: () => void
  isSubmitting?: boolean
  serverError?: string | null
}
```

Alternativa más limpia: renombrar `onSubmit` a `onPublish` en ProjectWizard y actualizar LaunchIdeaModal. Esta es la opción elegida para eliminar la confusión del submit temporal.

### Tokens CSS

```
Banner "Así verán tu proyecto":
  background-color: var(--color-hypothesis-bg)
  border: 1px solid var(--color-hypothesis-border)
  border-radius: var(--radius-xl)
  padding: var(--space-4)

Pill de template:
  background-color: var(--color-border)
  border-radius: var(--radius-full)
  padding: var(--space-1) var(--space-3)
  font-size: var(--text-xs)
```

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Debug Log References
(se rellenará durante la implementación)

### Completion Notes List
(se rellenará al completar)

### File List
(se rellenará al completar)
