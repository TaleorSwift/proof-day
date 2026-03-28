# Story 3.4: Project List View in Community

Status: ready-for-dev

## Story

Como miembro de una comunidad,
quiero ver todos los proyectos Live e Inactive de mi comunidad en una lista organizada,
para que pueda explorar y dar feedback a las ideas de mis compañeros.

## Acceptance Criteria

1. `/communities/[slug]` muestra grid de proyectos `live` e `inactive` accesibles a todos los miembros (FR14)
2. Builder ve también sus propios proyectos `draft` con badge diferenciado (FR15)
3. `ProjectCard` muestra: imagen destacada (`image_urls[0]`), título, badge de estado (`StatusBadge`), contador de feedbacks, Proof Score badge compact si disponible
4. Grid 3 columnas en desktop (lg) / 2 columnas en tablet (md)
5. Empty state si no hay proyectos `live`: "Esta comunidad no tiene proyectos aún" + CTA "Crear el primero" (solo si el usuario puede crear)
6. Proyectos ordenados por fecha de publicación (`created_at` desc) — drafts al final
7. Skeleton loading mientras carga (usar `Skeleton` de shadcn/ui)
8. GET /api/projects?communityId= devuelve proyectos filtrados por comunidad y membresía del usuario

## Rejection Criteria

- NO mostrar proyectos `draft` a usuarios que no sean el builder
- NO cargar todos los proyectos de la plataforma — siempre filtrado por `communityId`
- NO hacer fetch en Client Component directamente a Supabase — usar API Route o Server Component

## Tasks / Subtasks

- [ ] **T1: Feature branch**
  - [ ] `git checkout develop && git pull`
  - [ ] `git checkout -b feat/3-4-project-list-view-in-community`

- [ ] **T2: API Route GET /api/projects — lista por comunidad** (AC: 1, 2, 8)
  - [ ] Añadir `GET` handler a `app/api/projects/route.ts`:
    ```typescript
    export async function GET(request: Request) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json(
        { error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 }
      )

      const { searchParams } = new URL(request.url)
      const communityId = searchParams.get('communityId')
      if (!communityId) return NextResponse.json(
        { error: 'communityId es requerido', code: 'VALIDATION_ERROR' }, { status: 400 }
      )

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

      // El RLS ya filtra: los miembros ven live+inactive, el builder ve sus drafts
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, title, image_urls, status, builder_id, created_at')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })

      if (error) return NextResponse.json(
        { error: 'Error al obtener proyectos', code: 'PROJECTS_FETCH_ERROR' }, { status: 500 }
      )

      return NextResponse.json({ data: projects ?? [], count: projects?.length ?? 0 })
    }
    ```

- [ ] **T3: Añadir función a typed client wrapper**
  - [ ] Añadir a `lib/api/projects.ts`:
    ```typescript
    export async function getProjects(communityId: string): Promise<Project[]> {
      const res = await fetch(`/api/projects?communityId=${communityId}`)
      if (!res.ok) throw new Error((await res.json()).error)
      return (await res.json()).data
    }
    ```

- [ ] **T4: Componente ProjectCard** (AC: 3)
  - [ ] Crear `components/projects/ProjectCard.tsx` — Client Component:
    ```typescript
    // Props
    interface ProjectCardProps {
      project: Pick<Project, 'id' | 'title' | 'imageUrls' | 'status' | 'builderId'>
      communitySlug: string
      feedbackCount?: number
      proofScore?: 'Promising' | 'Needs iteration' | 'Weak' | null
      isLoading?: boolean
    }
    ```
    - Anatomía de la card (usando Card de shadcn/ui):
      ```
      [imagen destacada — aspect-ratio 16:9, next/image, alt=project.title]
      [title — font-semibold, truncate 2 líneas]
      [fila: StatusBadge | contador feedbacks "N feedbacks"]
      [ProofScoreBadge compact si proofScore !== null]
      ```
    - Toda la card es clickable → link a `/communities/{slug}/projects/{id}`
    - Estado `draft`: opacidad ligeramente reducida, badge "Borrador" (ya en StatusBadge)
    - Estado `inactive`: overlay sutil, badge "Inactivo"
    - `isLoading=true`: renderizar skeleton en lugar de contenido
  - [ ] Crear Storybook stories en `stories/projects/ProjectCard.stories.tsx`:
    - Story `Live`: estado live con imagen, 5 feedbacks
    - Story `LiveWithScore`: live con ProofScoreBadge "Promising"
    - Story `Draft`: borrador del builder
    - Story `Inactive`: proyecto inactivo
    - Story `Loading`: skeleton

- [ ] **T5: Componente ProjectGrid** (AC: 4, 7)
  - [ ] Crear `components/projects/ProjectGrid.tsx`:
    ```typescript
    // Props
    interface ProjectGridProps {
      projects: ProjectCardProps['project'][]
      communitySlug: string
      isLoading?: boolean
    }
    ```
    - Grid: `grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4`
    - Si `isLoading`: renderizar 6 `ProjectCard` con `isLoading=true` (skeleton)
    - Si `projects.length === 0` y no loading: renderizar `<ProjectsEmptyState />`

- [ ] **T6: Componente ProjectsEmptyState** (AC: 5)
  - [ ] Crear `components/projects/ProjectsEmptyState.tsx`:
    ```typescript
    // Props: communitySlug, canCreate (si el usuario es builder/admin)
    // Texto: "Esta comunidad no tiene proyectos aún"
    // CTA (si canCreate): Button → /communities/{slug}/projects/new ("Crear el primero")
    ```

- [ ] **T7: Actualizar /communities/[slug] — integrar ProjectGrid** (AC: 1, 2, 6, 7)
  - [ ] Actualizar `app/(app)/communities/[slug]/page.tsx` — Server Component:
    ```typescript
    export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
      const { slug } = await params
      const supabase = await createClient()

      // Leer comunidad
      const { data: community } = await supabase
        .from('communities')
        .select('id, name, description, image_url')
        .eq('slug', slug)
        .single()
      if (!community) notFound()

      // Leer proyectos (Server Component lee directamente — RLS filtra)
      const { data: projects } = await supabase
        .from('projects')
        .select('id, title, image_urls, status, builder_id, created_at')
        .eq('community_id', community.id)
        .order('created_at', { ascending: false })

      return (
        <main className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">{community.name}</h1>
            <Link href={`/communities/${slug}/projects/new`}>
              <Button>Nuevo proyecto</Button>
            </Link>
          </div>
          <ProjectGrid
            projects={projects ?? []}
            communitySlug={slug}
          />
        </main>
      )
    }
    ```
  - [ ] **Nota:** El feedback count y el Proof Score se añadirán en Stories 4 y 5. En esta story, `ProjectCard` muestra `feedbackCount=0` y `proofScore=null` por defecto.

- [ ] **T8: Skeleton loading** (AC: 7)
  - [ ] En `ProjectCard` con `isLoading=true`:
    ```typescript
    // Usar Skeleton de shadcn/ui
    return (
      <Card>
        <Skeleton className="aspect-video w-full" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </Card>
    )
    ```

- [ ] **T9: Tests unitarios** (AC: 1, 2)
  - [ ] Crear `tests/unit/projects/projectList.test.ts`:
    - Verificar que proyectos `draft` de otros no aparecen en la lista (lógica de filtro)
    - Verificar que el builder ve sus propios `draft`
    - Verificar ordenación por `created_at` desc
    - Al menos 3 tests

- [ ] **T10: Documentación funcional del módulo**
  - [ ] Crear `docs/project/modules/projects.md` con:
    - Qué hace (ciclo de vida de proyectos, estados, visibilidad)
    - Reglas de comportamiento (de ACs de 3-1 a 3-4)
    - Ficheros clave
    - Última actualización: Story 3.4

- [ ] **T11: PR y cierre**
  - [ ] `npm run test` — todos deben pasar
  - [ ] Commit: `feat(projects): add project list view in community`
  - [ ] Push + PR contra `develop`
  - [ ] Actualizar `sprint-status.yaml`: `3-4-project-list-view-in-community: review`

## Dev Notes

### Ordenación de proyectos

El criterio de ordenación es `created_at` desc. Los `draft` propios del builder aparecen en su posición cronológica (no al final) — el badge "Borrador" diferencia visualmente. Si en el futuro se quiere separar drafts, se puede hacer en el cliente ordenando después del fetch.

### Feedback count y Proof Score en esta story

En esta story, `ProjectCard` muestra `feedbackCount=0` y `proofScore=null` como valores por defecto. Las Stories 4 y 5 añadirán estos datos reales. La arquitectura de `ProjectCard` debe soportarlos como props opcionales desde el inicio (no hacer dos versiones del componente).

### Imagen next/image

```typescript
import Image from 'next/image'
// En ProjectCard:
<Image
  src={project.imageUrls[0] ?? '/placeholder-project.png'}
  alt={project.title}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 50vw, 33vw"
/>
```

Envolver en un `div` con `relative aspect-video overflow-hidden rounded-t-lg`.

### Storybook obligatorio para ProjectCard

`ProjectCard` es un componente reutilizable cross-dominio (aparece en la lista y en Story 3-3). Requiere Storybook story con todos los estados cubiertos.

### References

- [Source: epic-3-proyectos.md#Story 3.4] — ACs y notas técnicas
- [Source: architecture.md#Structure Patterns] — Storybook obligatorio para componentes de dominio
- [Source: ux-design-specification.md#Visual Foundation#Pantalla 5] — grid 3/2 columnas, ProjectCard anatomía
- [Source: stories/3-1-create-edit-project-draft.md] — tipos `Project`, `ProjectStatus`
- [Source: stories/3-3-publish-manage-project-states.md] — `StatusBadge` component

## Dev Agent Record

### Agent Model Used

_pendiente_

### Debug Log References

### Completion Notes List

### File List
