# Story 10.3: ProjectWizard con ejemplos contextuales (FR2)

Status: done

## Story

Como Builder que está creando un proyecto,
quiero un wizard multi-paso que muestre ejemplos contextuales según el tipo de proyecto elegido,
para que cada campo tenga guías relevantes a mi caso y pueda navegar entre pasos sin perder mis datos.

## Acceptance Criteria

1. **[AC-1]** Dado que estoy creando un proyecto con un template seleccionado, cuando el wizard renderiza el paso de descripción, entonces los campos "Problema" y "Solución" muestran un ejemplo contextual específico para el tipo de template elegido (tomado de `description_structure.problem.example` y `description_structure.solution.example`).

2. **[AC-2]** Dado que estoy en el paso 2 (descripción básica) y navego al paso 3 (detalles opcionales), cuando regreso al paso 2 con el botón "Anterior", entonces los datos introducidos en "Problema" y "Solución" se conservan intactos.

3. **[AC-3]** Dado que estoy en el último paso implementado (paso 3 — detalles opcionales) con los campos requeridos (title, problem, solution) rellenos, cuando el wizard renderiza, entonces el botón "Continuar" está habilitado y el usuario puede avanzar al siguiente paso del flujo (paso 4 — hipótesis, Story 10.5).

4. **[AC-4]** Dado que el wizard renderiza en mobile (viewport < 768px), cuando navego entre pasos, entonces cada paso es completamente accesible sin scroll horizontal y el indicador de progreso es visible.

5. **[AC-5]** Dado que no hay template seleccionado (usuario saltó el paso 1), cuando el wizard renderiza los campos de descripción, entonces se muestran los placeholders genéricos actuales (sin ejemplos de template).

## Tasks / Subtasks

- [x] **T1** — Crear `components/projects/ProjectWizard.tsx` — estructura y navegación (AC: 2, 3, 4)
  - [x] T1.1 Definir interfaz `WizardStep` con `id`, `label` y `component`
  - [x] T1.2 Definir `WizardFormData`: union de todos los campos de los pasos implementados (title, tagline, problem, solution, targetUser, demoLink, feedbackTopics, templateId, images)
  - [x] T1.3 Implementar estado central con `useReducer` — acciones: `SET_FIELD`, `NEXT_STEP`, `PREV_STEP`, `RESET`
  - [x] T1.4 Renderizar indicador de progreso: número de paso actual / total con barra o dots (responsive, visible en mobile)
  - [x] T1.5 Botones de navegación: "Anterior" (oculto en paso 1) y "Continuar" / "Guardar" en último paso
  - [x] T1.6 "Continuar" deshabilitado si campos requeridos del paso actual están vacíos
  - [x] T1.7 Test unitario: navegación entre pasos, datos conservados al regresar, botón Continuar habilitado/deshabilitado

- [x] **T2** — Paso 1 del wizard: selector de tipo (AC: 1, 5)
  - [x] T2.1 Integrar `ProjectTemplateSelector` (Story 10.2) como paso 1 del wizard
  - [x] T2.2 Fetchar templates al montar el wizard — estado `templates: ProjectTemplate[]`
  - [x] T2.3 Al seleccionar template, actualizar `WizardFormData.templateId` y `WizardFormData.selectedTemplate` en el estado del wizard
  - [x] T2.4 El paso 1 nunca bloquea "Continuar" — el template es opcional (AC-4 de Story 10.2)

- [x] **T3** — Paso 2 del wizard: descripción básica con ejemplos contextuales (AC: 1, 2, 5)
  - [x] T3.1 Crear `components/projects/wizard/WizardStepDescription.tsx` con campos: title (requerido), tagline (requerido), problem (requerido), solution (requerido)
  - [x] T3.2 Si `selectedTemplate` presente: mostrar `description_structure.problem.example` como texto de hint/ejemplo debajo del textarea de problema (texto en `var(--color-text-muted)`, prefijado con "Ejemplo: ")
  - [x] T3.3 Idem para solution: mostrar `description_structure.solution.example` debajo del textarea
  - [x] T3.4 Placeholders siguen siendo los de `description_structure.problem.placeholder` (Story 10.2) o los genéricos si no hay template
  - [x] T3.5 "Continuar" habilitado solo cuando title, problem, solution tienen contenido (tagline es requerido también — respetar schema actual)
  - [x] T3.6 Test: campos con template muestran hint; sin template no muestran hint; navegación conserva datos

- [x] **T4** — Paso 3 del wizard: detalles opcionales (AC: 3, 4)
  - [x] T4.1 Crear `components/projects/wizard/WizardStepDetails.tsx` con campos: targetUser (opcional), demoLink (opcional), feedbackTopics (opcional via `FeedbackTopicChips`), images (ImageUploader, requerido para publicar pero opcional para guardar como draft)
  - [x] T4.2 "Continuar" siempre habilitado en este paso (todos los campos son opcionales)
  - [x] T4.3 Test: campos opcionales, "Continuar" siempre activo

- [x] **T5** — Refactorizar `LaunchIdeaModal.tsx` para usar `ProjectWizard` (AC: 1–5)
  - [x] T5.1 `LaunchIdeaModal` ahora renderiza `ProjectWizard` en lugar de `LaunchIdeaForm` directamente
  - [x] T5.2 Submit temporal desde paso 3: llamar a `launchProject()` server action con todos los datos de `WizardFormData` — **deuda técnica:** se elimina en Story 10.4 al añadir el paso de preview. Añadir comentario `// TODO Story 10.4: eliminar submit temporal — reemplazar por avance al paso 'preview'`
  - [x] T5.3 Mantener comportamiento existente: `onSuccess`, `router.refresh()`, toast de confirmación, reset al cerrar
  - [x] T5.4 El `FormProvider` de react-hook-form puede moverse a dentro de `ProjectWizard` o mantenerse en el modal — elegir el que minimice cambios al submit existente
  - [x] T5.5 Test de regresión: comportamiento del modal antes de esta story sigue funcionando (submit, error handling, reset)

- [x] **T6** — Responsive y accesibilidad (AC: 4)
  - [x] T6.1 Verificar que en viewport 375px (iPhone SE) el wizard no tiene scroll horizontal
  - [x] T6.2 El indicador de progreso no sobrepasa el ancho del modal
  - [x] T6.3 Todos los campos tienen `id` + `htmlFor` vinculados correctamente
  - [x] T6.4 Botones de navegación accesibles con teclado (Tab order correcto)

- [x] **T7** — Lint, types y tests verdes
  - [x] T7.1 `npx tsc --noEmit` sin errores nuevos
  - [x] T7.2 `npm run lint` sin errores nuevos
  - [x] T7.3 `npm test` — todos los tests existentes + nuevos en verde (1360 tests, 131 ficheros)
  - [x] T7.4 Añadir story Storybook para `ProjectWizard` (estado inicial, paso 2 con template, paso 3)

## Dev Notes

### Contexto de negocio

Esta story transforma el formulario plano de creación en un wizard multi-paso. El objetivo es reducir la fricción cognitiva: el Builder ve un paso a la vez y recibe guía contextual según el tipo de proyecto. Los ejemplos de template son el valor diferencial de esta story respecto a un formulario genérico.

### Arquitectura / Componentes

**Ficheros a CREAR:**
- `components/projects/ProjectWizard.tsx` — orquestador de pasos, estado central con useReducer
- `components/projects/wizard/WizardStepDescription.tsx` — paso 2: title, tagline, problem, solution
- `components/projects/wizard/WizardStepDetails.tsx` — paso 3: targetUser, demoLink, feedbackTopics, images

**Ficheros a MODIFICAR:**
- `components/projects/LaunchIdeaModal.tsx` — sustituir `LaunchIdeaForm` por `ProjectWizard`
- `components/projects/LaunchIdeaForm.tsx` — puede degradarse a componente interno del paso 2, o mantenerse como referencia; revisar si hay otros consumers antes de eliminar

**Ficheros existentes reutilizados (sin modificar):**
- `components/projects/ProjectTemplateSelector.tsx` (creado en Story 10.2) — paso 1
- `components/projects/FeedbackTopicChips.tsx` — paso 3
- `components/projects/ImageUploader.tsx` — paso 3

### Patrones del proyecto

- Estado entre pasos: `useReducer` es preferible a múltiples `useState` para estados con varias acciones. Ver patrón de `LaunchIdeaModal` actual como referencia de estado de formulario complejo.
- Estilos: variables CSS inline. NO usar Tailwind ni clases externas. Ver `docs/project/design-tokens.md`.
- No hay React Query en el proyecto — fetch directo con `useEffect` + `useState`.
- Componentes de sub-paso en subcarpeta `wizard/` para no contaminar el directorio raíz de `components/projects/`.

### Estructura del estado `WizardFormData`

```typescript
interface WizardFormData {
  // Paso 1
  templateId: string | null
  selectedTemplate: ProjectTemplate | null
  // Paso 2
  title: string
  tagline: string
  problem: string
  solution: string
  // Paso 3
  targetUser: string
  demoLink: string
  feedbackTopics: string[]
  images: UploaderImage[]
  // Pasos 4+ (Story 10.5, Story 11.2 — solo placeholder aquí)
  hypothesis: string
}
```

### Indicador de progreso — pasos del wizard completo

Los pasos definidos en esta story son 1, 2, 3. Los pasos 4 (hipótesis) y 5 (preview) se añaden en Stories 10.5 y 10.4 respectivamente. El indicador de progreso debe diseñarse para ser extensible (array de pasos, no hardcodeado).

```typescript
// Estructura extensible de pasos
const WIZARD_STEPS = [
  { id: 'template', label: 'Tipo de proyecto' },
  { id: 'description', label: 'Descripción' },
  { id: 'details', label: 'Detalles' },
  // { id: 'hypothesis', label: 'Hipótesis' },  // Story 10.5
  // { id: 'preview', label: 'Vista previa' },    // Story 10.4
]
```

### Texto de ejemplo contextual

El `description_structure.problem.example` se muestra como texto auxiliar (no como placeholder). Ejemplo de implementación:

```tsx
{selectedTemplate && (
  <p style={{
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    margin: '0',
    fontStyle: 'italic',
  }}>
    Ejemplo: {selectedTemplate.descriptionStructure.problem.example}
  </p>
)}
```

### Scope de esta story

Esta story implementa **pasos 1, 2 y 3** del wizard. Los pasos adicionales se añaden en:
- Paso 4 (hipótesis): Story 10.5
- Paso 5 (preview): Story 10.4

El wizard en esta story termina en el paso 3. **Decisión de implementación (para no romper `LaunchIdeaModal`):** el paso 3 incluye temporalmente un botón "Publicar" que llama a `launchProject()` con los datos del wizard — mismo comportamiento que el formulario actual. Este submit temporal se elimina en Story 10.4, cuando el paso de preview pasa a ser el último paso con su propio botón "Publicar". Documentar como deuda técnica con `// TODO Story 10.4: eliminar submit temporal — reemplazar por avance al paso 'preview'`.

### Referencias
- [Source: _bmad-output/planning-artifacts/epics-phase2.md#Story 10.3] — ACs originales
- [Source: _bmad-output/implementation-artifacts/stories/10-2-selector-tipo-proyecto-project-template-selector.md] — ProjectTemplateSelector, WizardFormData.templateId
- [Source: components/projects/LaunchIdeaModal.tsx] — Modal contenedor actual: patrón de submit, reset, router.refresh
- [Source: components/projects/LaunchIdeaForm.tsx] — Campos actuales del formulario (referencia de paso 2)
- [Source: components/projects/FeedbackTopicChips.tsx] — Chips de topics para paso 3
- [Source: components/projects/ImageUploader.tsx] — Uploader de imágenes para paso 3
- [Source: lib/types/templates.ts] — `ProjectTemplate`, `DescriptionStructure` con `example` y `placeholder`
- [Source: docs/project/design-tokens.md] — Variables CSS del proyecto

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Debug Log References
- Merge de feat/10-2 en feat/10-3 para traer ProjectTemplateSelector y dependencias
- FormProvider de react-hook-form eliminado del modal — el wizard no usa RHF internamente (estado propio con useReducer)
- LaunchIdeaForm conservado sin modificar (referencia para Story 10.4)
- Tests de Story 9.8 (LaunchIdeaModal.test.tsx) y Story 10.2 (LaunchIdeaModal.10-2.test.tsx) actualizados para wizard

### Completion Notes List
- T5.4 Decisión: FormProvider eliminado del modal — wizard usa useReducer directamente. Minimiza acoplamiento con RHF.
- T6.4 Accesibilidad: todos los inputs tienen id + htmlFor, botones son `<button type="button">` nativos.
- Deuda técnica registrada: TODO Story 10.4 en WizardStepDetails.tsx línea 59.

### File List
**Creados:**
- `components/projects/ProjectWizard.tsx`
- `components/projects/wizard/WizardStepDescription.tsx`
- `components/projects/wizard/WizardStepDetails.tsx`
- `lib/fixtures/templates.ts` (traído de feat/10-2, necesario en main)
- `tests/component/projects/ProjectWizard.10-3.test.tsx`
- `tests/component/projects/WizardStepDescription.10-3.test.tsx`
- `tests/component/projects/WizardStepDetails.10-3.test.tsx`
- `tests/component/projects/LaunchIdeaModal.10-3.test.tsx`
- `stories/projects/ProjectWizard.stories.tsx`

**Modificados:**
- `components/projects/LaunchIdeaModal.tsx`
- `tests/component/projects/LaunchIdeaModal.test.tsx`
- `tests/component/projects/LaunchIdeaModal.10-2.test.tsx`
- `docs/project/modules/projects.md`
- `_bmad-output/execution-log.yaml`
