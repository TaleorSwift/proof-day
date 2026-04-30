# Módulo: Proyectos

**Última actualización:** Story 10.3 — ProjectWizard con ejemplos contextuales (2026-04-30)

---

## Qué hace

El módulo de Proyectos gestiona el ciclo de vida completo de las ideas de los builders dentro de una comunidad. Un proyecto representa una idea de negocio o producto que un builder quiere validar con los miembros de su comunidad.

### Ciclo de vida

```
draft → live → inactive
```

| Estado | Descripción |
|---|---|
| `draft` | Borrador — visible solo para el builder. Editable. |
| `live` | Publicado — visible para todos los miembros. Recibe feedbacks. |
| `inactive` | Desactivado — visible para todos (histórico), no recibe nuevos feedbacks. |

### Visibilidad

- **Miembros de la comunidad:** ven proyectos `live` e `inactive`
- **Builder (autor):** ve también sus propios proyectos `draft`
- **No miembros:** no ven ningún proyecto (RLS + verificación de membresía en API)

La visibilidad se aplica en dos capas:
1. **RLS en Supabase** — primera línea de defensa
2. **Verificación de membresía en API Route** — segunda línea de defensa

---

## Reglas de comportamiento

Derivadas de las Acceptance Criteria de Stories 3.1–3.4:

### Creación y edición (Story 3.1)
- Solo miembros de la comunidad pueden crear proyectos
- Un proyecto nuevo siempre se crea en estado `draft`
- El builder puede editar su proyecto mientras esté en `draft`

### Galería de imágenes (Story 3.2)
- Máximo 5 imágenes por proyecto
- Formatos: JPG, PNG, WebP — máximo 5MB por imagen
- La primera imagen (`image_urls[0]`) es la imagen destacada
- Las imágenes son opcionales — si no hay imagen, se muestra `/placeholder-project.png`

### Estados del proyecto (Story 3.3)
- Transición `draft → live`: requiere título, problema, solución e hipótesis
- Transición `live → inactive`: el builder puede desactivar en cualquier momento
- Una vez `inactive`, el proyecto no puede volver a `live` (inmutable)

### Lista en comunidad (Story 3.4)
- Los proyectos se ordenan por `created_at` desc (más reciente primero)
- Grid: 3 columnas en desktop (lg) / 2 columnas en tablet y mobile (md)
- Empty state si no hay proyectos `live`: "Esta comunidad no tiene proyectos aún" + CTA "Crear el primero"
- Skeleton loading durante el fetch (6 cards esqueleto)
- `feedbackCount` y `proofScore` se añadirán en Stories 4 y 5

### Feed del proyecto — secciones (Story 9.6)
- El feed se divide en dos secciones: `"🔴 Live — aceptando feedback"` y `"Cerrados"` (story 9.6)
- Los headings usan uppercase, font-semibold, text-xs y color-text-muted (style compacto) (story 9.6)
- No existe subtítulo bajo el heading Live — se eliminó por incoherente con el estilo compacto (story 9.6)

### ProjectCard — tarjeta horizontal (Story 9.6)
- La tarjeta muestra: thumbnail 120×90px | centro (título + StatusBadge, tagline, autor, contadores) | HeartButton (story 9.6)
- Tagline: se muestra `project.tagline` si existe; si no, `project.problem`; si ninguno, se omite. 1 línea truncada. (story 9.6)
- Autor: se muestra `profiles.name` real del builder como texto plano, sin avatar. Fallback: primeros 8 chars del builderId (story 9.6)
- `wouldUseCount` se muestra solo si > 0 para evitar "0 lo usarían" en proyectos nuevos (story 9.6)
- Placeholder sin imagen: gradiente `linear-gradient(135deg, hypothesis-bg, hypothesis-border)` sin texto ni iniciales (story 9.6)
- Los builder names se resuelven con batch-fetch de profiles (1 query IN) — no hay JOIN directo entre projects y profiles porque `builder_id` referencia `auth.users`, no `profiles` (story 9.6)

---

## Ficheros clave

### Types
- `lib/types/projects.ts` — `ProjectStatus`, `Project`, `ProjectRow`, helpers (incluye `templateId` — story 10.1)
- `lib/types/templates.ts` — `ProjectTemplate`, `ProjectTemplateRow`, `templateFromRow` (story 10.1)

### API Routes
- `app/api/projects/route.ts` — thin controller: POST (crear) + GET (listar por comunidad)
- `lib/repositories/projects.repository.ts` — queries Supabase (DIP)
- `lib/services/projects.service.ts` — validateOwnership, validateMembership
- `lib/api/middleware/require-auth.ts` — auth compartida
- `app/api/projects/[id]/route.ts` — GET (detalle) + PUT (editar)
- `app/api/projects/[id]/status/route.ts` — PATCH (cambiar estado)
- `app/api/projects/[id]/images/route.ts` — POST/DELETE (imágenes)
- `app/api/projects/[id]/images/reorder/route.ts` — PATCH (reordenar)

### API Client (lib/api)
- `lib/api/projects.ts` — `createProject`, `updateProject`, `getProject`, `getProjects`, `publishProject`, `deactivateProject`, `uploadProjectImage`, `deleteProjectImage`, `reorderProjectImages`

### Componentes
- `components/projects/ProjectForm.tsx` — formulario crear/editar (story 3.1)
- `components/projects/DraftBanner.tsx` — banner de borrador (story 3.1)
- `components/projects/StatusBadge.tsx` — badge de estado (story 3.3/3.4)
- `components/projects/ProjectStateActions.tsx` — acciones de estado (story 3.3)
- `components/projects/ProjectCard.tsx` — tarjeta de proyecto (story 3.4)
- `components/projects/ProjectGrid.tsx` — grid de proyectos (story 3.4)
- `components/projects/ProjectsEmptyState.tsx` — estado vacío (story 3.4)
- `components/projects/LaunchIdeaModal.tsx` — dialog ~640px para lanzar ideas desde el feed. Orquesta `ProjectWizard` con fetch a `/api/templates`. Props: `open`, `onOpenChange`, `communitySlug`, `onSuccess?` (story 9.8, story 10.2, story 10.3)
- `components/projects/LaunchIdeaForm.tsx` — formulario plano original, mantenido como referencia. Ya no usado directamente por `LaunchIdeaModal` (story 9.8)
- `components/projects/ProjectWizard.tsx` — orquestador wizard multi-paso (pasos 1-3). Estado central con `useReducer`. Array `WIZARD_STEPS` extensible. Props: `templates`, `onSubmit`, `onCancel`, `isSubmitting?`, `serverError?` (story 10.3)
- `components/projects/wizard/WizardStepDescription.tsx` — paso 2 del wizard: title, tagline, problem, solution. Muestra hints "Ejemplo: …" bajo problem y solution cuando hay `selectedTemplate` (story 10.3)
- `components/projects/wizard/WizardStepDetails.tsx` — paso 3 del wizard: targetUser, demoLink, images, feedbackTopics. Submit temporal con `// TODO Story 10.4: eliminar submit temporal` (story 10.3)
- `components/projects/ProjectTemplateSelector.tsx` — selector de tipo de proyecto. Grid de cards con icono Lucide + nombre. Props: `templates`, `selectedId`, `onSelect`. Incluye opción "Sin tipo" (story 10.2)
- `components/projects/FeedbackTopicChips.tsx` — chips toggleables reutilizables. Props: `value: string[]`, `onChange`. Usa mapeo display (español) → valor interno (story 9.8)
- `components/projects/ImageUploader.tsx` — uploader inline hasta N imágenes con previews y eliminar. Props: `images`, `onImagesChange`, `maxImages` (story 9.8)

### Server Actions
- `actions/projects/launchProject.ts` — crea un proyecto con `status = 'live'` directamente. Llama a `revalidatePath`. Input: `LaunchProjectInput` (incluye `templateId?: string | null`). Output: `{ success: true, projectId }` | `{ success: false, error }` (story 9.8, story 10.2)

### Utilidades
- `lib/utils/imageUpload.ts` — `uploadImageToStorage(file): Promise<{ url, path }>` — subida directa a Supabase Storage bucket `project-images` desde el cliente. Usada por `ImageUploader` (story 9.8)

### Páginas
- `app/(app)/communities/[slug]/page.tsx` — lista de proyectos de la comunidad
- `app/(app)/communities/[slug]/projects/new/page.tsx` — crear proyecto (fallback; se mantiene intacto)
- `app/(app)/communities/[slug]/projects/[projectSlug]/page.tsx` — ver proyecto
- `app/(app)/communities/[slug]/projects/[projectSlug]/edit/page.tsx` — editar proyecto

### Storybook
- `lib/fixtures/templates.ts` — fixtures de los 5 templates para tests y Storybook (story 10.2)
- `stories/projects/ProjectTemplateSelector.stories.tsx` — 3 stories: NingunoSeleccionado, UnoSeleccionado, SinTemplates (story 10.2)
- `stories/projects/ProjectWizard.stories.tsx` — 4 stories: EstadoInicial, Paso1ConTemplates, ConErrorDeServidor, Submitting (story 10.3)
- `stories/projects/ProjectCard.stories.tsx` — 5 stories: Live, LiveWithScore, Draft, Inactive, Loading
- `stories/projects/LaunchIdeaModal.stories.tsx` — 4 stories: EstadoVacio, ConDatosRellenos, EstadoCargando, ChipsSeleccionados (story 9.8)
- `stories/projects/FeedbackTopicChips.stories.tsx` — 4 stories: SinSeleccion, TresSeleccionados, TodosSeleccionados, Interactivo (story 9.8)
- `stories/projects/ImageUploader.stories.tsx` — 3 stories: SinImagenes, ConDosImagenes, LimiteAlcanzado (story 9.8)
- `stories/projects/ProjectForm.stories.tsx` — 4 stories: ModoCrear, ModoEditar, ErrorValidacion, ErrorServidor (story PR6)
- `stories/projects/ImageGallery.stories.tsx` — 4 stories: ReadOnly, SinImagenes, Editable, EditableConfirmacionBorrado (story PR6)

### Tests
- `tests/unit/projects/projectList.test.ts` — lógica de visibilidad y ordenación
- `tests/unit/projects/LaunchIdeaModal.test.tsx` — 19 tests: render, campos, validación, submit (story 9.8)
- `tests/unit/projects/FeedbackTopicChips.test.tsx` — 13 tests: render, aria-pressed, toggle, mapeo (story 9.8)
- `tests/unit/projects/ImageUploader.test.tsx` — 7 tests: render, límite, previews, eliminar (story 9.8)
- `tests/unit/projects/ProjectForm.test.tsx` — 27 tests: render, submit, defaultValues, feedbackTopics, isSubmitting (PR6)
- `tests/unit/projects/ProjectEditPage.test.tsx` — 12 tests: no-auth, non-owner, non-draft, happy path (PR6)
- `tests/e2e/projects/project-edit.spec.ts` — 7 tests: defaults, guardar, non-owner, non-draft, validación, no-auth (PR6)

---

### Wizard multi-paso — reglas (Story 10.3)

- El wizard tiene 3 pasos definidos en `WIZARD_STEPS` (extensible con pasos 4 y 5 en Stories 10.5 y 10.4) (story 10.3)
- Paso 1 (Tipo de proyecto): siempre válido — el template es opcional. El botón "Anterior" no aparece. (story 10.3)
- Paso 2 (Descripción): `title`, `tagline`, `problem`, `solution` requeridos — "Continuar" deshabilitado si alguno está vacío. (story 10.3)
- Paso 3 (Detalles): todos los campos opcionales — el botón "+ Lanzar proyecto" siempre habilitado. (story 10.3)
- Los datos introducidos en cualquier paso se conservan al navegar hacia atrás y adelante (estado centralizado en `useReducer`). (story 10.3 — AC-2)
- Si hay template seleccionado, los campos "Problema" y "Solución" muestran un hint contextual bajo el textarea: `"Ejemplo: {template.example}"` en `--color-text-muted`, italic. (story 10.3 — AC-1)
- Sin template seleccionado, los hints de ejemplo no aparecen. (story 10.3 — AC-5)
- El paso 3 incluye un submit temporal (`launchProject`) con comentario `// TODO Story 10.4: eliminar submit temporal`. Se reemplazará en Story 10.4 con el paso de preview. (story 10.3 — T5.2)
- Al cerrar y reabrir `LaunchIdeaModal`, el wizard se reinicia en el paso 1. Implementado con `key={open ? 'open' : 'closed'}` en `<ProjectWizard>` dentro del modal. (story 10.3 — HIGH-1)

---

### Selector de tipo de proyecto — reglas (Story 10.2)

- Al abrir `LaunchIdeaModal`, se hace fetch a `GET /api/templates` — siempre se muestra la sección "Tipo de proyecto (opcional)" (story 10.2)
- Cada card muestra: icono Lucide, nombre del template y `reviewer_context` como descripción corta (máx. 2 líneas, `--color-text-muted`, `--text-xs`) (story 10.2)
- Grid responsive: 2 columnas en mobile, 3 columnas en desktop (≥768px) — clase CSS `.template-grid` (story 10.2)
- El selector es opcional — si no se selecciona ningún tipo, el proyecto se crea con `template_id = null` (retrocompatibilidad total con proyectos Phase 1) (story 10.2)
- Cuando el fetch devuelve 0 templates, se muestra "No hay tipos disponibles" en lugar de un grid vacío (story 10.2)
- Al seleccionar un tipo, los campos "Problema" y "Solución" muestran los placeholders del template seleccionado (story 10.2)
- Si el fetch falla, el formulario principal sigue operativo (degradación silenciosa) (story 10.2)
- El `template_id` se almacena en la columna `projects.template_id` (FK nullable) al guardar (story 10.2)

---

### Modal "Lanzar idea" — reglas (Story 9.8)

- El botón "+ Lanzar idea" del `CommunityFeedHeader` abre `LaunchIdeaModal` (estado local en el Client Component)
- El modal crea proyectos con `status = 'live'` directamente (no pasan por draft)
- Los campos requeridos son: title, tagline, problem, solution, hypothesis
- Los campos opcionales son: targetUser, demoLink
- Las imágenes se suben a Supabase Storage antes del submit; límite de 3 en el modal (vs 5 en la página de edición)
- Los chips de feedback mapean display en español → valor interno en snake_case (6 chips fijos)
- La ruta `/communities/[slug]/projects/new` se mantiene como fallback — no se elimina (AC-7)
- Tras submit exitoso: modal se cierra + `router.refresh()` para revalidar el feed
- `revalidatePath` se llama en el server action tras inserción exitosa
- Chips disponibles: `problem_clarity`, `willingness_to_use`, `technical_feasibility`, `missing_features`, `market_fit`, `ux_concerns`

---

### Detalle de proyecto — reglas de sidebar (Story 9.7)

- La sidebar es visible cuando `isOwner || status === 'live' || status === 'inactive'` (story 9.7)
- Para proyectos `draft`: la sidebar no se muestra para nadie (story 9.7)
- Tagline aparece debajo del título como subtítulo (text-sm, muted, 1 línea) cuando existe (story 9.7)
- Caption "Usa estas imágenes para dar feedback más preciso." aparece bajo la imagen destacada cuando hay imágenes (story 9.7)
- El heading de hipótesis es `"🔬 Hipótesis a validar"` (story 9.7)
- Sidebar para reviewer en `live`: ValidationSignalCard + FeedbackFormInline (story 9.7)
- Sidebar para reviewer en `inactive`: ValidationSignalCard + mensaje "Esta idea ya no acepta feedback." (story 9.7)
- Sidebar para owner: bloque "Feedback recibido" + ValidationSignalCard + ProofScoreSidebar (story 9.7)
- FeedbackCTA en columna principal eliminado para reviewers — el formulario está en la sidebar (story 9.7)

---

## Supabase

### Tabla `projects`

```sql
id               uuid primary key
community_id     uuid references communities(id) on delete cascade
builder_id       uuid references auth.users(id) on delete cascade
title            text not null
problem          text not null
solution         text not null
hypothesis       text not null
image_urls       text[] not null default '{}'
status           text not null default 'draft' -- 'draft' | 'live' | 'inactive'
decision         text null -- 'iterate' | 'scale' | 'abandon'
decided_at       timestamptz null
created_at       timestamptz not null default now()
updated_at       timestamptz not null default now()
-- Story 8.1
target_user      text null
demo_url         text null
feedback_topics  text[] null
-- Story 9.1
tagline          text null       -- resumen 1 línea de la propuesta de valor
would_use_count  integer not null default 0  -- contador denormalizado; actualizado por trigger
```

### RLS
- `live` e `inactive`: visibles para todos los miembros de la comunidad
- `draft`: visible solo para el builder (`builder_id = auth.uid()`)

### Contadores denormalizados (Story 9.1)
- `would_use_count`: número de feedbacks donde el revisor respondió "Sí" a "¿Lo usarías?". Actualizado automáticamente por el trigger `feedbacks_recompute_would_use` en INSERT/UPDATE/DELETE de feedbacks. (story 9.1)

### Extensión Phase 2 (Story 10.1)

**Nueva columna en `projects`:**
- `template_id uuid null` → FK a `project_templates.id` ON DELETE SET NULL. Nullable para retrocompatibilidad con proyectos existentes. (story 10.1)

### Tabla `project_templates`

Tabla global de tipos de proyecto — datos de configuración, no de usuario.

```sql
id                    uuid primary key default gen_random_uuid()
type                  text not null unique    -- 'saas' | 'feature' | 'internal_process' | 'physical_product' | 'service'
name                  text not null           -- nombre legible
description_structure jsonb not null          -- {problem: {placeholder, example}, solution: {placeholder, example}}
reviewer_context      text not null           -- instrucciones para el reviewer según el tipo
created_at            timestamptz default now()
```

RLS: SELECT para `authenticated` (datos de config global, sin restricción de comunidad). (story 10.1)

**5 tipos seeded** (migration 023): `feature`, `internal_process`, `physical_product`, `saas`, `service`. (story 10.1)

**API:** `GET /api/templates` retorna `{ data: ProjectTemplate[] }` ordenados por name. Requiere autenticación. (story 10.1)
