# Story 3.3: Publish & Manage Project States

Status: ready-for-dev

## Story

Como Builder,
quiero poder publicar mi proyecto (Draft → Live) y marcarlo como inactivo cuando lo decida,
para que controle la visibilidad de mi idea y el flujo de feedback.

## Acceptance Criteria

1. Botón "Publicar" visible en la vista del proyecto cuando está en `draft` → cambia estado a `live` (FR11)
2. Confirmación antes de publicar mediante inline banner (no Dialog): "¿Listo para compartir con tu comunidad? [Publicar] [Cancelar]"
3. Proyecto `live` visible para todos los miembros de la comunidad (FR14)
4. Botón "Marcar como inactivo" disponible para el Builder en proyectos `live` (FR12)
5. Proyecto `inactive`: banner "Proyecto inactivo — el feedback está cerrado", feedback bloqueado
6. Proyecto `inactive` visible para la comunidad (FR14) con badge "Inactivo"
7. No se puede volver de `inactive` a `live` en MVP
8. Validación backend: rechazo de transiciones de estado inválidas
9. Antes de publicar: el proyecto debe tener al menos 1 imagen (validación)

## Rejection Criteria

- NO cambiar estado desde el cliente directamente — siempre a través de API Route
- NO permitir que un Reviewer envíe feedback en proyectos `draft` o `inactive` (FR19 — verificado en API de feedback, Story 4)
- NO permitir transición `inactive → live`
- NO usar Dialog para la confirmación de publicación — es un inline banner

## Tasks / Subtasks

- [ ] **T1: Feature branch**
  - [ ] `git checkout develop && git pull`
  - [ ] `git checkout -b feat/3-3-publish-manage-project-states`

- [ ] **T2: API Route PATCH /api/projects/[id]/status** (AC: 1, 4, 8)
  - [ ] Crear `app/api/projects/[id]/status/route.ts`:
    ```typescript
    import { NextResponse } from 'next/server'
    import { createClient } from '@/lib/supabase/server'
    import { z } from 'zod'

    const statusTransitionSchema = z.object({
      status: z.enum(['live', 'inactive']),
    })

    // Máquina de estados: transiciones válidas
    const VALID_TRANSITIONS: Record<string, string[]> = {
      draft: ['live'],
      live: ['inactive'],
      inactive: [],   // no hay transiciones desde inactive en MVP
    }

    export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json(
        { error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 }
      )

      const { id } = await params
      const body = await request.json()
      const result = statusTransitionSchema.safeParse(body)
      if (!result.success) return NextResponse.json(
        { error: result.error.issues[0].message, code: 'VALIDATION_ERROR' }, { status: 400 }
      )

      const { data: project } = await supabase
        .from('projects')
        .select('id, builder_id, status, image_urls')
        .eq('id', id)
        .single()

      if (!project) return NextResponse.json(
        { error: 'Proyecto no encontrado', code: 'PROJECT_NOT_FOUND' }, { status: 404 }
      )
      if (project.builder_id !== user.id) return NextResponse.json(
        { error: 'Solo el builder puede cambiar el estado', code: 'PROJECT_FORBIDDEN' }, { status: 403 }
      )

      const targetStatus = result.data.status
      const validNext = VALID_TRANSITIONS[project.status] ?? []
      if (!validNext.includes(targetStatus)) return NextResponse.json(
        { error: `Transición inválida: ${project.status} → ${targetStatus}`, code: 'PROJECT_INVALID_TRANSITION' },
        { status: 422 }
      )

      // Validación al publicar: mínimo 1 imagen
      if (targetStatus === 'live' && project.image_urls.length === 0) return NextResponse.json(
        { error: 'Debes añadir al menos una imagen antes de publicar', code: 'PROJECT_MISSING_IMAGES' },
        { status: 422 }
      )

      const { data: updated, error } = await supabase
        .from('projects')
        .update({ status: targetStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error || !updated) return NextResponse.json(
        { error: 'Error al cambiar estado', code: 'PROJECT_STATUS_ERROR' }, { status: 500 }
      )

      return NextResponse.json({ data: updated })
    }
    ```

- [ ] **T3: Funciones en typed client wrapper**
  - [ ] Añadir a `lib/api/projects.ts`:
    ```typescript
    export async function publishProject(id: string): Promise<Project> {
      const res = await fetch(`/api/projects/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'live' }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      return (await res.json()).data
    }

    export async function deactivateProject(id: string): Promise<Project> {
      const res = await fetch(`/api/projects/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'inactive' }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      return (await res.json()).data
    }
    ```

- [ ] **T4: Componente ProjectStateActions** (AC: 1, 2, 4)
  - [ ] Crear `components/projects/ProjectStateActions.tsx` — Client Component:
    ```
    Props:
      projectId: string
      currentStatus: ProjectStatus
      isBuilder: boolean
      onStatusChange: (newStatus: ProjectStatus) => void

    Comportamiento:
      - Si status='draft' + isBuilder:
          Mostrar "Publicar" → al hacer clic: mostrar inline confirm ("¿Listo para compartir?")
          Inline confirm: botón "Publicar" (primario) + "Cancelar" (ghost)
          Al confirmar: llamar a publishProject(), actualizar estado, llamar a onStatusChange
      - Si status='live' + isBuilder:
          Mostrar "Marcar como inactivo" (ghost destructive)
          Al hacer clic: llamar a deactivateProject(), actualizar estado
      - Si status='inactive': no mostrar acciones
      - isLoading durante petición: botones deshabilitados
      - Error: inline bajo los botones
    ```

- [ ] **T5: Actualizar vista del proyecto con estados** (AC: 5, 6, 9)
  - [ ] Actualizar `app/(app)/communities/[slug]/projects/[id]/page.tsx`:
    - Server Component: carga proyecto, pasa status y builderId a Client Components
    - Si `status === 'draft'`: mostrar `DraftBanner` + `ProjectStateActions` con botón "Publicar"
    - Si `status === 'live'`: mostrar `ProjectStateActions` con botón "Marcar como inactivo"
    - Si `status === 'inactive'`: mostrar `InactiveBanner`
  - [ ] Crear `components/projects/InactiveBanner.tsx`:
    ```typescript
    export function InactiveBanner() {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-[var(--color-text-secondary)]">
          Proyecto inactivo — el feedback está cerrado
        </div>
      )
    }
    ```

- [ ] **T6: Badge de estado en ProjectCard** (AC: 3, 6)
  - [ ] Crear `components/projects/StatusBadge.tsx`:
    ```typescript
    import { Badge } from '@/components/ui/badge'

    const STATUS_CONFIG = {
      draft:    { label: 'Borrador',  variant: 'outline' as const },
      live:     { label: 'Live',      variant: 'default' as const },
      inactive: { label: 'Inactivo', variant: 'secondary' as const },
    }

    export function StatusBadge({ status }: { status: 'draft' | 'live' | 'inactive' }) {
      const { label, variant } = STATUS_CONFIG[status]
      return <Badge variant={variant}>{label}</Badge>
    }
    ```

- [ ] **T7: Tests unitarios** (AC: 8)
  - [ ] Crear `tests/unit/projects/projectStateTransitions.test.ts`:
    - `draft → live` es válido
    - `live → inactive` es válido
    - `draft → inactive` es inválido
    - `inactive → live` es inválido
    - `inactive → draft` es inválido
    - Publicar con `image_urls = []` retorna error
    - Al menos 6 tests

- [ ] **T8: PR y cierre**
  - [ ] `npm run test` — todos deben pasar
  - [ ] Commit: `feat(projects): publish and manage project states`
  - [ ] Push + PR contra `develop`
  - [ ] Actualizar `sprint-status.yaml`: `3-3-publish-manage-project-states: review`

## Dev Notes

### Máquina de estados — transitions

```
draft ──────→ live ──────→ inactive
              (solo Builder puede transicionar)
              (inactive es terminal en MVP)
```

- La validación vive en el API Route — el cliente solo muestra los botones correctos
- El RLS ya filtra la visibilidad (draft=solo builder, live/inactive=miembros)
- El feedback estará bloqueado en la capa de API de feedback (Story 4) — esta story no toca feedback

### Inline confirm (no Dialog)

El patrón de confirmación de publicación es un banner inline que aparece bajo el botón:
```
[Publicar]
       ↓ (al hacer clic)
"¿Listo para compartir con tu comunidad?"
[Publicar ahora]  [Cancelar]
```
No usar Dialog — el botón "Publicar" ya tiene suficiente peso visual sin modal.

### References

- [Source: epic-3-proyectos.md#Story 3.3] — ACs y notas técnicas
- [Source: architecture.md#Process Patterns] — auth en API Routes
- [Source: ux-design-specification.md#Visual Foundation#Pantalla 6] — estados del sidebar
- [Source: stories/3-1-create-edit-project-draft.md] — esquema de `projects` table

## Dev Agent Record

### Agent Model Used

_pendiente_

### Debug Log References

### Completion Notes List

### File List
