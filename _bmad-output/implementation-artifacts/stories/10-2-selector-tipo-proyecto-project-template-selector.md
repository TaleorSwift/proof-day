# Story 10.2: Selector de tipo de proyecto (FR1)

Status: review

## Story

Como Builder que quiere crear un proyecto,
quiero seleccionar el tipo de proyecto desde una pantalla previa al formulario principal,
para que los placeholders y ejemplos del formulario sean relevantes a mi caso de uso y el registro quede vinculado al template seleccionado.

## Acceptance Criteria

1. **[AC-1]** Dado que estoy en la pantalla de crear proyecto (LaunchIdeaModal abierto), cuando la pantalla carga, entonces veo el componente `ProjectTemplateSelector` con los 5 tipos disponibles (nombre, descripción corta e icono por tipo) antes del formulario principal.

2. **[AC-2]** Dado que selecciono un tipo de template en `ProjectTemplateSelector`, cuando avanzo al formulario de descripción, entonces los campos "Problema" y "Solución" muestran los `placeholder` y `example` definidos en `description_structure` del template seleccionado.

3. **[AC-3]** Dado que guardo el proyecto (submit del formulario), cuando se crea el registro en DB, entonces `projects.template_id` almacena el `id` del template seleccionado.

4. **[AC-4]** Dado que no selecciono ningún template y completo el formulario, cuando guardo, entonces el proyecto se crea con `template_id = null` (retrocompatibilidad total con proyectos Phase 1).

5. **[AC-5]** Dado que `GET /api/templates` se llama autenticado como miembro de una comunidad, cuando la respuesta llega, entonces retorna `{ data: ProjectTemplate[] }` con los 5 tipos ordenados por `name` (este AC es de Story 10.1 pero se verifica en integración aquí).

## Tasks / Subtasks

- [x] **T1** — Crear `components/projects/ProjectTemplateSelector.tsx` (AC: 1, 2)
  - [x] T1.1 Implementar grid de 5 cards (2 columnas en mobile, 3 en desktop >= 768px) usando CSS variables del proyecto
  - [x] T1.2 Cada card muestra: icono (Lucide), nombre del template y descripción corta (máx. 2 líneas)
  - [x] T1.3 Iconos por tipo: `saas` → `Rocket`, `feature` → `Puzzle`, `internal_process` → `Settings`, `physical_product` → `Package`, `service` → `Users` (todos de `lucide-react`)
  - [x] T1.4 Card seleccionada: borde con `var(--color-accent)` y fondo `var(--color-hypothesis-bg)` (equivalente de highlight)
  - [x] T1.5 Props: `templates: ProjectTemplate[]`, `selectedId: string | null`, `onSelect: (id: string | null) => void`
  - [x] T1.6 Opción "Sin tipo" o skip visible (permite retrocompatibilidad AC-4)
  - [x] T1.7 Escribir test unitario TDD: render con 5 cards, selección cambia estado, opción skip funciona

- [x] **T2** — Integrar `ProjectTemplateSelector` en `LaunchIdeaModal.tsx` (AC: 1, 2, 3, 4)
  - [x] T2.1 En `LaunchIdeaModal`, añadir estado `templateId: string | null` y `selectedTemplate: ProjectTemplate | null`
  - [x] T2.2 Fetchar templates al montar (llamada a `GET /api/templates`) — guardar en estado local `templates`
  - [x] T2.3 Renderizar `ProjectTemplateSelector` encima del `LaunchIdeaForm` existente
  - [x] T2.4 Pasar `selectedTemplate?.descriptionStructure` a `LaunchIdeaForm` como prop `descriptionStructure?: DescriptionStructure`
  - [x] T2.5 En el submit (`onSubmit`), incluir `templateId` en los datos pasados a `launchProject()` server action
  - [x] T2.6 Escribir test de integración: modal con selector renderizado, selección de template, submit con templateId

- [x] **T3** — Actualizar `LaunchIdeaForm.tsx` para aceptar placeholders dinámicos (AC: 2)
  - [x] T3.1 Añadir prop opcional `descriptionStructure?: DescriptionStructure` (importar de `lib/types/templates.ts`)
  - [x] T3.2 Cuando `descriptionStructure` presente, usar `descriptionStructure.problem.placeholder` como `placeholder` del textarea de problema
  - [x] T3.3 Idem para el campo "Solución" con `descriptionStructure.solution.placeholder`
  - [x] T3.4 Cuando no hay template seleccionado, mantener placeholders actuales por defecto
  - [x] T3.5 Test: form renderiza con placeholder por defecto sin descriptionStructure; y con placeholder del template cuando se pasa

- [x] **T4** — Actualizar Server Action `launchProject` para aceptar `templateId` (AC: 3, 4)
  - [x] T4.1 Localizar `actions/projects/launchProject.ts` y añadir `templateId?: string | null` al input
  - [x] T4.2 Pasar `templateId` a la llamada POST `/api/projects` en el body (via INSERT directo a Supabase en esta action)

- [x] **T5** — Actualizar validación y API route POST `/api/projects` (AC: 3, 4)
  - [x] T5.1 En `lib/validations/projects.ts`: añadir `template_id: z.string().uuid().nullable().optional()` a `createProjectSchema`
  - [x] T5.2 En `app/api/projects/route.ts`: extraer `template_id` del `result.data` y pasarlo al `projectsRepo.create()`
  - [x] T5.3 En `lib/repositories/projects.repository.ts`: añadir `templateId?: string | null` al parámetro de `create()` e incluirlo en el INSERT como `template_id`
  - [x] T5.4 Test unitario: `createProjectSchema` acepta body con `template_id: null`, con uuid válido y sin campo

- [x] **T6** — Lint, types y tests verdes (AC: 1–5)
  - [x] T6.1 `npx tsc --noEmit` sin errores nuevos (2 pre-existentes FeedbackDialog, 4 templates.route)
  - [x] T6.2 `npm run lint` sin errores nuevos (30 pre-existentes)
  - [x] T6.3 `npm test` — 1303 tests pasados (127 ficheros) — sin regresiones
  - [x] T6.4 Añadir story Storybook para `ProjectTemplateSelector` (estados: ninguno seleccionado, uno seleccionado, sin templates)

## Dev Notes

### Contexto de negocio

Esta story es el punto de entrada visible del Epic 10 para el usuario. El Builder verá el selector de tipo como primer paso del flujo de creación. La retrocompatibilidad (AC-4) es crítica: proyectos Phase 1 sin `template_id` no deben romperse.

### Arquitectura / Componentes

**Ficheros a CREAR:**
- `components/projects/ProjectTemplateSelector.tsx` — nuevo componente UI

**Ficheros a MODIFICAR:**
- `components/projects/LaunchIdeaModal.tsx` — añadir fetch de templates + estado `templateId` + renderizar selector + pasar templateId al submit
- `components/projects/LaunchIdeaForm.tsx` — añadir prop `descriptionStructure?: DescriptionStructure` para placeholders dinámicos
- `actions/projects/launchProject.ts` — añadir `templateId?: string | null` al input
- `lib/validations/projects.ts` — añadir `template_id` nullable/optional a `launchIdeaSchema` y `createProjectSchema`
- `app/api/projects/route.ts` — extraer y pasar `template_id` al repository
- `lib/repositories/projects.repository.ts` — añadir `templateId?: string | null` al `create()` params e INSERT

### Patrones del proyecto

- Estilos: variables CSS inline (`var(--color-*)`, `var(--space-*)`, `var(--radius-*)`). Ver `docs/project/design-tokens.md`.
- Fetch en cliente: patrón `useEffect` + `useState` (no React Query). Ver `LaunchIdeaModal.tsx` como referencia de fetch en componente modal.
- Iconos: `lucide-react` ya instalado. Importar directamente: `import { Rocket, Puzzle, Settings, Package, Users } from 'lucide-react'`.
- Validación: Zod + react-hook-form + zodResolver. Ver `lib/validations/projects.ts`.
- Repository pattern: `lib/repositories/projects.repository.ts` — la capa de acceso a datos es el único lugar donde se escribe SQL/Supabase.

### Scope de esta story

Esta story cubre: selector UI + integración en modal + propagación de `template_id` a DB.

**NO está en scope:**
- Wizard multi-paso completo (Story 10.3)
- Preview del proyecto (Story 10.4)
- Campo hipótesis en wizard (Story 10.5)
- `GET /api/templates` — ya implementado en Story 10.1

### Cambio en `createProjectSchema` — nota importante

`launchIdeaSchema` (usado por `LaunchIdeaForm` vía `LaunchIdeaModal`) es distinto de `createProjectSchema` (usado por `app/api/projects/route.ts`). El campo `template_id` debe añadirse a **ambos** schemas o al menos al schema que valida el body del POST. La acción de servidor `launchProject` usa `launchIdeaSchema` para el formulario y envía el body al endpoint que usa `createProjectSchema`. Añadir `template_id` a `createProjectSchema`:

```typescript
// lib/validations/projects.ts
export const createProjectSchema = z.object({
  // ... campos existentes ...
  // Story 10.2 — template Phase 2
  template_id: z.string().uuid().nullable().optional(),
})
```

### Ejemplo de `create()` en repository con `template_id`

```typescript
async create(data: {
  // ... params existentes ...
  templateId?: string | null  // Story 10.2
}) {
  return supabase
    .from('projects')
    .insert({
      // ... campos existentes ...
      // Story 10.2 — template Phase 2 (undefined no se envía a Supabase)
      ...(data.templateId !== undefined && { template_id: data.templateId }),
    })
    .select()
    .single()
}
```

### TDD Outside-In — orden de tests

1. Test del componente `ProjectTemplateSelector` (render, selección, skip)
2. Test de `LaunchIdeaForm` con y sin `descriptionStructure`
3. Test del schema Zod con `template_id` null, uuid y ausente
4. Test de integración del modal completo (opcional, puede ser E2E)

### Referencias
- [Source: _bmad-output/planning-artifacts/epics-phase2.md#Story 10.2] — ACs originales
- [Source: _bmad-output/implementation-artifacts/stories/10-1-migraciones-db-project-templates-y-extensiones-projects.md] — Tipos `ProjectTemplate`, `DescriptionStructure`, `ProjectTemplateRow`
- [Source: components/projects/LaunchIdeaModal.tsx] — Modal contenedor: patron de submit, estado, reset
- [Source: components/projects/LaunchIdeaForm.tsx] — Form actual con campos title, tagline, problem, solution, hypothesis
- [Source: lib/validations/projects.ts] — Schemas Zod actuales: `launchIdeaSchema`, `createProjectSchema`
- [Source: app/api/projects/route.ts] — Patron de route POST con validation + repository
- [Source: lib/repositories/projects.repository.ts#create] — Patron INSERT con campos opcionales via spread
- [Source: docs/project/design-tokens.md] — Variables CSS del proyecto

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6 (Homer — DS workflow, 2026-04-30)

### Debug Log References
- UUID validation en createProjectSchema: Zod v4 rechaza UUIDs con versión fuera de rango 1-8. Los tests usaron UUIDs RFC-4122 válidos (e.g. `a3bb189e-8bf9-3888-9912-ace4e6543002`).
- `launchProject.ts` usa Supabase directamente (no el repository) — el `template_id` se añade directamente al INSERT en la action, y también en el repository para el path `/api/projects`.
- `var(--color-hypothesis-modal-bg)` no existe en design-tokens — se usó `var(--color-hypothesis-bg)` que es el equivalente definido.

### Completion Notes List
- T1: `ProjectTemplateSelector` creado con grid 2col, iconos Lucide, estado seleccionado via aria-pressed, botón "Sin tipo". 9 tests verdes.
- T2: `LaunchIdeaModal` actualizado con fetch a `/api/templates`, estado templateId/selectedTemplate, selector renderizado sobre el form, templateId en submit. 9 tests de integración verdes.
- T3: `LaunchIdeaForm` acepta `descriptionStructure?: DescriptionStructure` y usa sus placeholders. 4 tests verdes.
- T4: `LaunchIdeaInput` añade `templateId?: string | null`, INSERT a Supabase incluye `template_id` via spread condicional.
- T5: `createProjectSchema` añade `template_id` nullable/optional, `projects.repository.ts` acepta `templateId`, `app/api/projects/route.ts` lo propaga. 4 tests verdes.
- T6: 1303 tests pasados (127 ficheros). 0 errores nuevos TS/lint. Storybook story creada con 3 states.
- Fixtures: `lib/fixtures/templates.ts` creado con 5 templates de ejemplo, exportado desde barrel.
- ACs verificados: AC-1 (selector visible), AC-2 (placeholders dinámicos), AC-3 (template_id en DB), AC-4 (retrocompat null), AC-5 (API ya existente Story 10.1).

### File List
- `components/projects/ProjectTemplateSelector.tsx` — CREADO
- `components/projects/LaunchIdeaModal.tsx` — MODIFICADO
- `components/projects/LaunchIdeaForm.tsx` — MODIFICADO
- `actions/projects/launchProject.ts` — MODIFICADO
- `lib/validations/projects.ts` — MODIFICADO
- `app/api/projects/route.ts` — MODIFICADO
- `lib/repositories/projects.repository.ts` — MODIFICADO
- `lib/fixtures/templates.ts` — CREADO
- `lib/fixtures/index.ts` — MODIFICADO
- `stories/projects/ProjectTemplateSelector.stories.tsx` — CREADO
- `tests/unit/projects/ProjectTemplateSelector.test.tsx` — CREADO
- `tests/unit/projects/createProjectSchema.10-2.test.ts` — CREADO
- `tests/component/projects/LaunchIdeaModal.10-2.test.tsx` — CREADO
- `tests/component/projects/LaunchIdeaForm.10-2.test.tsx` — CREADO
