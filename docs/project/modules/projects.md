# Módulo: Proyectos

**Última actualización:** Story 9.7 — Project detail tagline + sidebar universal + feedback inline (2026-04-11)

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
- `lib/types/projects.ts` — `ProjectStatus`, `Project`, `ProjectRow`, helpers

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
- `components/projects/LaunchIdeaModal.tsx` — dialog ~540px para lanzar ideas desde el feed (story 9.8). Props: `open`, `onOpenChange`, `communitySlug`, `onSuccess?`
- `components/projects/LaunchIdeaForm.tsx` — formulario interno del modal, usa FormProvider de react-hook-form (story 9.8)
- `components/projects/FeedbackTopicChips.tsx` — chips toggleables reutilizables. Props: `value: string[]`, `onChange`. Usa mapeo display (español) → valor interno (story 9.8)
- `components/projects/ImageUploader.tsx` — uploader inline hasta N imágenes con previews y eliminar. Props: `images`, `onImagesChange`, `maxImages` (story 9.8)

### Server Actions
- `actions/projects/launchProject.ts` — crea un proyecto con `status = 'live'` directamente. Llama a `revalidatePath`. Input: `LaunchProjectInput`. Output: `{ success: true, projectId }` | `{ success: false, error }` (story 9.8)

### Utilidades
- `lib/utils/imageUpload.ts` — `uploadImageToStorage(file): Promise<{ url, path }>` — subida directa a Supabase Storage bucket `project-images` desde el cliente. Usada por `ImageUploader` (story 9.8)

### Páginas
- `app/(app)/communities/[slug]/page.tsx` — lista de proyectos de la comunidad
- `app/(app)/communities/[slug]/projects/new/page.tsx` — crear proyecto (fallback; se mantiene intacto)
- `app/(app)/communities/[slug]/projects/[id]/page.tsx` — ver proyecto
- `app/(app)/communities/[slug]/projects/[id]/edit/page.tsx` — editar proyecto

### Storybook
- `stories/projects/ProjectCard.stories.tsx` — 5 stories: Live, LiveWithScore, Draft, Inactive, Loading
- `stories/projects/LaunchIdeaModal.stories.tsx` — 4 stories: EstadoVacio, ConDatosRellenos, EstadoCargando, ChipsSeleccionados (story 9.8)
- `stories/projects/FeedbackTopicChips.stories.tsx` — 4 stories: SinSeleccion, TresSeleccionados, TodosSeleccionados, Interactivo (story 9.8)
- `stories/projects/ImageUploader.stories.tsx` — 3 stories: SinImagenes, ConDosImagenes, LimiteAlcanzado (story 9.8)

### Tests
- `tests/unit/projects/projectList.test.ts` — lógica de visibilidad y ordenación
- `tests/unit/projects/LaunchIdeaModal.test.tsx` — 19 tests: render, campos, validación, submit (story 9.8)
- `tests/unit/projects/FeedbackTopicChips.test.tsx` — 13 tests: render, aria-pressed, toggle, mapeo (story 9.8)
- `tests/unit/projects/ImageUploader.test.tsx` — 7 tests: render, límite, previews, eliminar (story 9.8)

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
