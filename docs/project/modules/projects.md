# Módulo: Proyectos

**Última actualización:** Story 9.6 — Feed secciones Live/Cerrados + ProjectCard + bugs autor (2026-04-11)

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

### Páginas
- `app/(app)/communities/[slug]/page.tsx` — lista de proyectos de la comunidad
- `app/(app)/communities/[slug]/projects/new/page.tsx` — crear proyecto
- `app/(app)/communities/[slug]/projects/[id]/page.tsx` — ver proyecto
- `app/(app)/communities/[slug]/projects/[id]/edit/page.tsx` — editar proyecto

### Storybook
- `stories/projects/ProjectCard.stories.tsx` — 5 stories: Live, LiveWithScore, Draft, Inactive, Loading

### Tests
- `tests/unit/projects/projectList.test.ts` — lógica de visibilidad y ordenación

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
