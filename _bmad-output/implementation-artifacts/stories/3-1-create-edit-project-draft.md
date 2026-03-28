# Story 3.1: Create & Edit Project (Draft)

Status: ready-for-dev

## Story

Como Builder,
quiero poder crear un proyecto en Draft con título, descripción del problema, solución propuesta, hipótesis e imágenes,
para que pueda refinar mi idea antes de exponerla a la comunidad.

## Acceptance Criteria

1. Botón "Nuevo proyecto" visible en `/communities/[slug]` solo para usuarios autenticados
2. Pantalla `/communities/[slug]/projects/new` con campos: título (obligatorio, max 120 chars), descripción del problema (obligatorio, max 1000 chars), solución propuesta (obligatorio, max 1000 chars), hipótesis (obligatorio, 1 campo, max 500 chars), imágenes (mínimo 1, máximo 5 — campo de URL por defecto; Story 3-2 añadirá upload real)
3. Proyecto se crea en estado `draft` — solo visible para el Builder que lo creó (FR15)
4. Builder puede editar todos los campos mientras el proyecto está en `draft` (FR10)
5. Ruta de edición: `/communities/[slug]/projects/[id]/edit` — carga los datos del proyecto y permite guardar cambios
6. En la vista del proyecto Draft: banner "En borrador — no visible para la comunidad"
7. Validación inline bajo cada campo (no toast): campos vacíos, límite de caracteres, límite de imágenes
8. En la lista de proyectos de la comunidad, el Builder ve sus proyectos Draft con badge "Borrador" — los demás miembros NO los ven

## Rejection Criteria

- NO usar Server Actions — toda mutación va por API Route
- NO importar `@supabase/supabase-js` o `@supabase/ssr` fuera de `lib/supabase/`
- NO usar `getSession()` — usar `supabase.auth.getUser()` en API Routes
- NO errores como toast — siempre inline
- NO crear tabla sin migración SQL versionada en `supabase/migrations/`
- NO mostrar proyectos Draft a otros miembros de la comunidad

## Tasks / Subtasks

- [ ] **T1: Feature branch**
  - [ ] `git checkout develop && git pull`
  - [ ] `git checkout -b feat/3-1-create-edit-project-draft`

- [ ] **T2: Migración SQL — tabla `projects` + RLS** (AC: 3, 8)
  - [ ] Comprobar `ls supabase/migrations/` para usar el siguiente número disponible
  - [ ] Crear `supabase/migrations/00X_create_projects.sql`:
    ```sql
    CREATE TABLE projects (
      id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
      builder_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      title        text NOT NULL,
      problem      text NOT NULL,
      solution     text NOT NULL,
      hypothesis   text NOT NULL,
      image_urls   text[] NOT NULL DEFAULT '{}',
      status       text NOT NULL CHECK (status IN ('draft', 'live', 'inactive')) DEFAULT 'draft',
      decision     text CHECK (decision IN ('iterate', 'scale', 'abandon')),
      decided_at   timestamptz,
      created_at   timestamptz NOT NULL DEFAULT now(),
      updated_at   timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX idx_projects_community_id ON projects(community_id);
    CREATE INDEX idx_projects_builder_id ON projects(builder_id);
    CREATE INDEX idx_projects_status ON projects(status);
    ```
  - [ ] RLS policies en la misma migración o en `supabase/migrations/00Y_rls_projects.sql`:
    ```sql
    ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

    -- Builder puede leer sus propios proyectos (draft + live + inactive)
    CREATE POLICY "builder_read_own_projects"
      ON projects FOR SELECT
      USING (auth.uid() = builder_id);

    -- Miembros de la comunidad ven proyectos live e inactive (no draft de otros)
    CREATE POLICY "members_read_live_projects"
      ON projects FOR SELECT
      USING (
        status IN ('live', 'inactive')
        AND auth.uid() IN (
          SELECT user_id FROM community_members WHERE community_id = projects.community_id
        )
      );

    -- Solo el builder puede insertar su proyecto
    CREATE POLICY "builder_insert_project"
      ON projects FOR INSERT
      WITH CHECK (auth.uid() = builder_id);

    -- Solo el builder puede actualizar su propio proyecto
    CREATE POLICY "builder_update_own_project"
      ON projects FOR UPDATE
      USING (auth.uid() = builder_id);
    ```

- [ ] **T3: Schema Zod** (AC: 2, 7)
  - [ ] Crear `lib/validations/projects.ts`:
    ```typescript
    import { z } from 'zod'

    export const createProjectSchema = z.object({
      title: z.string()
        .min(1, 'El título es obligatorio')
        .max(120, 'El título no puede superar 120 caracteres'),
      problem: z.string()
        .min(1, 'La descripción del problema es obligatoria')
        .max(1000, 'La descripción no puede superar 1000 caracteres'),
      solution: z.string()
        .min(1, 'La solución propuesta es obligatoria')
        .max(1000, 'La solución no puede superar 1000 caracteres'),
      hypothesis: z.string()
        .min(1, 'La hipótesis es obligatoria')
        .max(500, 'La hipótesis no puede superar 500 caracteres'),
      imageUrls: z.array(z.string().url('URL de imagen inválida'))
        .min(1, 'Debes añadir al menos una imagen')
        .max(5, 'No puedes añadir más de 5 imágenes'),
      communityId: z.string().uuid(),
    })

    export const updateProjectSchema = createProjectSchema.partial().omit({ communityId: true })

    export type CreateProjectInput = z.infer<typeof createProjectSchema>
    export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
    ```

- [ ] **T4: Tipos TypeScript** (AC: 3)
  - [ ] Crear `lib/types/projects.ts`:
    ```typescript
    export type ProjectStatus = 'draft' | 'live' | 'inactive'
    export type ProjectDecision = 'iterate' | 'scale' | 'abandon'

    export interface Project {
      id: string
      communityId: string
      builderId: string
      title: string
      problem: string
      solution: string
      hypothesis: string
      imageUrls: string[]
      status: ProjectStatus
      decision: ProjectDecision | null
      decidedAt: string | null
      createdAt: string
      updatedAt: string
    }
    ```

- [ ] **T5: API Route POST /api/projects — crear proyecto** (AC: 2, 3)
  - [ ] Crear `app/api/projects/route.ts`:
    ```typescript
    import { NextResponse } from 'next/server'
    import { createClient } from '@/lib/supabase/server'
    import { createProjectSchema } from '@/lib/validations/projects'

    export async function POST(request: Request) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json(
        { error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 }
      )

      const body = await request.json()
      const result = createProjectSchema.safeParse(body)
      if (!result.success) return NextResponse.json(
        { error: result.error.issues[0].message, code: 'VALIDATION_ERROR' }, { status: 400 }
      )

      const { communityId, ...projectData } = result.data

      // Verificar membresía
      const { data: member } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single()
      if (!member) return NextResponse.json(
        { error: 'No eres miembro de esta comunidad', code: 'COMMUNITY_ACCESS_DENIED' }, { status: 403 }
      )

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          community_id: communityId,
          builder_id: user.id,
          title: projectData.title,
          problem: projectData.problem,
          solution: projectData.solution,
          hypothesis: projectData.hypothesis,
          image_urls: projectData.imageUrls,
          status: 'draft',
        })
        .select()
        .single()

      if (error || !project) return NextResponse.json(
        { error: 'Error al crear el proyecto', code: 'PROJECT_CREATE_ERROR' }, { status: 500 }
      )

      return NextResponse.json({ data: project }, { status: 201 })
    }
    ```

- [ ] **T6: API Route PUT /api/projects/[id] — editar proyecto** (AC: 4, 5)
  - [ ] Crear `app/api/projects/[id]/route.ts`:
    ```typescript
    import { NextResponse } from 'next/server'
    import { createClient } from '@/lib/supabase/server'
    import { updateProjectSchema } from '@/lib/validations/projects'

    export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json(
        { error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 }
      )

      const { id } = await params
      const body = await request.json()
      const result = updateProjectSchema.safeParse(body)
      if (!result.success) return NextResponse.json(
        { error: result.error.issues[0].message, code: 'VALIDATION_ERROR' }, { status: 400 }
      )

      // Verificar que el proyecto existe y pertenece al builder
      const { data: existing } = await supabase
        .from('projects')
        .select('id, status, builder_id')
        .eq('id', id)
        .single()

      if (!existing) return NextResponse.json(
        { error: 'Proyecto no encontrado', code: 'PROJECT_NOT_FOUND' }, { status: 404 }
      )
      if (existing.builder_id !== user.id) return NextResponse.json(
        { error: 'No tienes permiso para editar este proyecto', code: 'PROJECT_FORBIDDEN' }, { status: 403 }
      )
      if (existing.status !== 'draft') return NextResponse.json(
        { error: 'Solo puedes editar proyectos en borrador', code: 'PROJECT_NOT_DRAFT' }, { status: 422 }
      )

      const updateData: Record<string, unknown> = { ...result.data, updated_at: new Date().toISOString() }
      if (result.data.imageUrls) {
        updateData.image_urls = result.data.imageUrls
        delete updateData.imageUrls
      }

      const { data: project, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error || !project) return NextResponse.json(
        { error: 'Error al actualizar el proyecto', code: 'PROJECT_UPDATE_ERROR' }, { status: 500 }
      )

      return NextResponse.json({ data: project })
    }
    ```

- [ ] **T7: Typed client wrapper** (AC: 2, 4)
  - [ ] Crear/actualizar `lib/api/projects.ts`:
    ```typescript
    import type { Project } from '@/lib/types/projects'
    import type { CreateProjectInput, UpdateProjectInput } from '@/lib/validations/projects'

    export async function createProject(data: CreateProjectInput): Promise<Project> {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      return (await res.json()).data
    }

    export async function updateProject(id: string, data: UpdateProjectInput): Promise<Project> {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      return (await res.json()).data
    }

    export async function getProject(id: string): Promise<Project> {
      const res = await fetch(`/api/projects/${id}`)
      if (!res.ok) throw new Error((await res.json()).error)
      return (await res.json()).data
    }
    ```

- [ ] **T8: GET /api/projects/[id] — leer un proyecto** (AC: 5 — necesario para cargar datos en edición)
  - [ ] Añadir `GET` handler a `app/api/projects/[id]/route.ts`:
    ```typescript
    export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 })

      const { id } = await params
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (!project) return NextResponse.json({ error: 'Proyecto no encontrado', code: 'PROJECT_NOT_FOUND' }, { status: 404 })
      return NextResponse.json({ data: project })
    }
    ```

- [ ] **T9: ProjectForm — Client Component** (AC: 2, 7)
  - [ ] Crear `components/projects/ProjectForm.tsx`:
    - `react-hook-form` + `zodResolver(createProjectSchema)`
    - Campos: `title` (Input), `problem` (Textarea), `solution` (Textarea), `hypothesis` (Textarea), `imageUrls` (lista dinámica de inputs — mínimo 1, máximo 5)
    - Errores inline bajo cada campo con `<p className="text-sm text-destructive">`
    - Modo `create` (POST) y modo `edit` (PUT) controlado por prop `projectId?: string`
    - `isLoading` → botón deshabilitado ("Guardando...")
    - En modo create: llama a `createProject()` y hace `router.push` a vista del proyecto
    - En modo edit: llama a `updateProject()` y muestra mensaje de éxito
    - **Imágenes:** campo de URL strings (se reemplaza en Story 3-2). Input por cada URL + botón "Añadir imagen" / "Eliminar".

- [ ] **T10: Página /communities/[slug]/projects/new** (AC: 1, 2)
  - [ ] Crear `app/(app)/communities/[slug]/projects/new/page.tsx`:
    ```typescript
    // Server Component — lee slug del community para pasar communityId al form
    export default async function NewProjectPage({ params }: { params: Promise<{ slug: string }> }) {
      const { slug } = await params
      const supabase = await createClient()
      const { data: community } = await supabase
        .from('communities')
        .select('id')
        .eq('slug', slug)
        .single()
      if (!community) notFound()
      return (
        <main className="container max-w-2xl py-8">
          <h1 className="text-2xl font-semibold mb-6">Nuevo proyecto</h1>
          <ProjectForm communityId={community.id} />
        </main>
      )
    }
    ```

- [ ] **T11: Página /communities/[slug]/projects/[id]/edit** (AC: 4, 5)
  - [ ] Crear `app/(app)/communities/[slug]/projects/[id]/edit/page.tsx`:
    - Server Component, carga proyecto con `lib/supabase/client.ts`
    - Si `project.status !== 'draft'` → `notFound()` (no se puede editar draft en otro estado)
    - Renderiza `<ProjectForm projectId={project.id} defaultValues={project} />`

- [ ] **T12: Vista básica del proyecto + banner Draft** (AC: 6)
  - [ ] Crear `app/(app)/communities/[slug]/projects/[id]/page.tsx` (vista básica):
    - Server Component, carga proyecto
    - Si `status === 'draft'`: renderiza `<DraftBanner />` en la parte superior
    - Muestra título, problema, solución, hipótesis, imágenes (lista simple en esta story)
    - **Nota:** Esta vista se expande significativamente en Stories 3-3 y 3-4
  - [ ] Crear `components/projects/DraftBanner.tsx`:
    ```typescript
    export function DraftBanner() {
      return (
        <div className="bg-[var(--color-hypothesis-bg)] border border-[var(--color-hypothesis-border)] rounded-lg px-4 py-3 text-sm text-[var(--color-text-secondary)]">
          En borrador — no visible para la comunidad
        </div>
      )
    }
    ```

- [ ] **T13: Botón "Nuevo proyecto" en lista de comunidad** (AC: 1)
  - [ ] En `app/(app)/communities/[slug]/page.tsx` (existe de story 2-3 o crear stub): añadir botón `<Link href={`/communities/${slug}/projects/new`}>Nuevo proyecto</Link>` para usuarios autenticados
  - [ ] **Nota:** Si la página aún no existe, crear un stub mínimo — se expande en Story 3-4

- [ ] **T14: Tests unitarios** (AC: 2, 7)
  - [ ] Crear `tests/unit/projects/createProject.test.ts`:
    - `createProjectSchema` valida título vacío → error
    - `createProjectSchema` valida título > 120 chars → error
    - `createProjectSchema` valida imageUrls vacío → error
    - `createProjectSchema` valida imageUrls > 5 → error
    - `createProjectSchema` valida URL inválida en imageUrls → error
    - `createProjectSchema` acepta entrada válida → ok
    - Al menos 6 tests

- [ ] **T15: PR y cierre**
  - [ ] `npm run test` — todos deben pasar
  - [ ] `git add` — solo ficheros de esta story
  - [ ] Commit: `feat(projects): create and edit draft project`
  - [ ] Push + PR contra `develop`
  - [ ] Actualizar `sprint-status.yaml`: `3-1-create-edit-project-draft: review`

## Dev Notes

### Learnings de Epic 1 y Story 2.1

- `lib/supabase/server.ts` exporta `createClient()` — usar en API Routes
- `lib/supabase/client.ts` para Server Components
- `getUser()` en API Routes, `getClaims()` en middleware — NUNCA `getSession()`
- `react-hook-form` + `zodResolver` para formularios — no reinventar validación
- `searchParams` y `params` en Next.js 15 son `Promise<{...}>` — hacer `await`
- Migraciones: comprobar numeración existente antes de crear

### Dependencias de otras stories

- **Prerrequisito:** Epic 2 (Story 2.1) — tabla `communities` y `community_members` deben existir
- **Story 3-2** reemplazará el campo de imagen URL por el `ImageGallery` component completo
- **Story 3-3** añadirá botón "Publicar" y estado `live`/`inactive`
- **Story 3-4** implementará la lista de proyectos completa con `ProjectCard`
- **Story 2-3** debería haber creado `/communities/[slug]/page.tsx` — si no existe, crear stub mínimo

### Patrón de acceso a Supabase

```
Client Component → lib/api/projects.ts → fetch('/api/projects') → API Route → Supabase SDK
Server Component → lib/supabase/client.ts → Supabase SDK directamente
```

### Esquema de base de datos

```
projects
  id uuid PK
  community_id uuid FK → communities(id) CASCADE
  builder_id   uuid FK → auth.users(id)
  title        text NOT NULL
  problem      text NOT NULL
  solution     text NOT NULL
  hypothesis   text NOT NULL
  image_urls   text[] DEFAULT '{}'      ← array de URLs (Storage paths o URLs externas)
  status       text CHECK IN ('draft','live','inactive') DEFAULT 'draft'
  decision     text CHECK IN ('iterate','scale','abandon') NULL
  decided_at   timestamptz NULL
  created_at   timestamptz
  updated_at   timestamptz
```

### RLS — lógica de visibilidad

- `draft`: solo el builder puede leerlo (builder_id = auth.uid())
- `live` e `inactive`: cualquier miembro de la comunidad puede leerlo
- Solo el builder puede insertar y actualizar sus proyectos
- Política de visibilidad de draft a través de RLS — no filtrado en aplicación

### Estructura de ficheros a crear

```
supabase/migrations/
  00X_create_projects.sql        ← comprobar numeración

app/(app)/communities/[slug]/
  projects/
    new/
      page.tsx                   ← CREAR
    [id]/
      page.tsx                   ← CREAR (vista básica, se expande en 3-3/3-4)
      edit/
        page.tsx                 ← CREAR

app/api/projects/
  route.ts                       ← CREAR: POST
  [id]/
    route.ts                     ← CREAR: GET + PUT

components/projects/
  ProjectForm.tsx                ← CREAR
  DraftBanner.tsx                ← CREAR

lib/
  api/projects.ts                ← CREAR/ACTUALIZAR
  validations/projects.ts        ← CREAR
  types/projects.ts              ← CREAR

tests/unit/projects/
  createProject.test.ts          ← CREAR
```

### References

- [Source: epic-3-proyectos.md#Story 3.1] — User story, ACs y notas técnicas
- [Source: architecture.md#Process Patterns] — auth en API Routes, validación Zod, community membership check
- [Source: architecture.md#Structure Patterns] — organización de ficheros, regla de oro Supabase
- [Source: architecture.md#Data Architecture] — migraciones, naming, RLS
- [Source: ux-design-specification.md#Journey 1] — Builder journey, banner draft, campos del formulario
- [Source: stories/2-1-create-community.md] — patrones establecidos en Epic 2

## Dev Agent Record

### Agent Model Used

_pendiente_

### Debug Log References

### Completion Notes List

### File List
