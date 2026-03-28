# Story 2.3: Community Access Control & Listing

Status: done

## Story

Como miembro de una o más comunidades,
quiero ver solo las comunidades de las que soy miembro y que el contenido de otras comunidades sea completamente inaccesible,
para que el aislamiento privado de cada comunidad esté garantizado tanto en la UI como a nivel de base de datos.

## Acceptance Criteria

1. `/communities` lista SOLO las comunidades del usuario autenticado — únicamente comunidades donde existe una fila en `community_members` con el `user_id` del usuario actual (FR8)
2. Acceso por URL directa a una comunidad (`/communities/[slug]`) sin membresía → redirect a `/communities` con mensaje "No tienes acceso a esta comunidad" (no 403 raw)
3. RLS en Supabase reforzada: política `SELECT` en `communities` solo si `auth.uid()` existe en `community_members` para esa `community_id` — segunda línea de defensa además del filtro explícito en API Route
4. Card de comunidad en el listado muestra: nombre, descripción (truncada a 2 líneas si es larga), imagen (con fallback a avatar con inicial del nombre si no hay imagen), y número de miembros
5. Si el usuario pertenece a exactamente una comunidad: redirect automático desde `/communities` directamente a `/communities/[slug]` de esa comunidad (sin pasar por el listado)
6. Navbar muestra selector de comunidad activa cuando el usuario pertenece a 2 o más comunidades — dropdown con lista de comunidades del usuario y la comunidad activa destacada
7. `GET /api/communities` devuelve la lista de comunidades del usuario incluyendo el campo `memberCount` (número de miembros) para cada comunidad
8. La página `/communities/[slug]` muestra el layout base de la comunidad (nombre, descripción, imagen) — placeholder preparado para stories futuras (lista de proyectos en Epic 3)

## Rejection Criteria

- NO importar `@supabase/supabase-js` o `@supabase/ssr` fuera de `lib/supabase/` (ESLint lo bloquea)
- NO usar `getSession()` — en API Routes usar `supabase.auth.getUser()`, en middleware usar `getClaims()`
- NO crear tabla sin migración SQL versionada en `supabase/migrations/`
- NO usar Server Actions para mutaciones — todas las mutaciones van por API Route
- NO hardcodear colores — usar tokens CSS del design system (`--color-background`, `--color-surface`, `--color-text-primary`, etc.)
- NO redirigir al usuario a una página de error raw (403/404) — siempre redirect con mensaje contextual
- NO exponer datos de comunidades a las que el usuario no pertenece, ni siquiera el nombre — la existencia de la comunidad debe ser opaca para no-miembros

## Tasks / Subtasks

- [x] **T1: Feature branch** (prerequisito)
  - [x] `git checkout develop && git pull`
  - [x] `git checkout -b feat/2-3-community-access-control-listing`

- [x] **T2: Migración SQL — RLS reforzada en `communities`** (AC: 3)
  - [ ] Comprobar `ls supabase/migrations/` — usar siguiente número disponible tras las existentes en esta rama
  - [ ] Crear `supabase/migrations/006_rls_communities_member_access.sql`:
    ```sql
    -- Política SELECT en communities: solo miembros pueden leer su comunidad
    -- La policy existente (story 2.1) puede necesitar actualización/reemplazo
    -- según el estado actual de las policies en esta rama

    -- Eliminar policy existente si aplica (verificar nombre exacto)
    DROP POLICY IF EXISTS "members_read_own_community" ON communities;

    -- Nueva policy más explícita: solo si auth.uid() es miembro
    CREATE POLICY "members_read_own_community"
      ON communities FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM community_members
          WHERE community_members.community_id = communities.id
            AND community_members.user_id = auth.uid()
        )
      );
    ```
  - [x] Verificar que las policies existentes de `community_members` (UPDATE, DELETE para admins) no se ven afectadas
  - [ ] Aplicar migración vía Supabase Dashboard (SQL Editor) o `supabase db push`

- [x] **T3: Tipos TypeScript — extender tipo `Community`** (AC: 4, 7)
  - [ ] Editar `lib/types/communities.ts` — añadir campo `memberCount` al tipo existente:
    ```typescript
    export interface Community {
      id: string
      name: string
      slug: string
      description: string
      imageUrl: string | null
      createdAt: string
      memberCount: number  // nuevo campo para story 2.3
    }
    ```
  - [ ] Verificar que el tipo `Community` en snake_case (si existe para mapeo interno) incluye `member_count`

- [x] **T4: API Route — GET /api/communities con memberCount** (AC: 1, 7)
  - [ ] Editar `app/api/communities/route.ts` — actualizar el handler GET:
    - La query debe incluir un join o subconsulta para obtener el conteo de miembros por comunidad
    - Patrón recomendado con Supabase:
      ```typescript
      const { data: communities, error } = await supabase
        .from('communities')
        .select(`
          id,
          name,
          slug,
          description,
          image_url,
          created_at,
          community_members!inner(count)
        `)
        .eq('community_members.user_id', user.id)
      ```
    - Alternativamente, query separada para member counts si el join no retorna el formato esperado
    - Mapear `snake_case` de BD a `camelCase` en la respuesta: `image_url → imageUrl`, `created_at → createdAt`, `member_count → memberCount`
    - Respuesta: `{ data: Community[], count: number }` (patrón GET collection de architecture.md)
  - [ ] Asegurar que el filtro explícito por membresía del usuario permanece activo (segunda línea de defensa además de RLS, como en story 2.1 CR2-F2)

- [x] **T5: Página `/communities` — Server Component con lógica de redirect** (AC: 1, 5)
  - [ ] Editar `app/communities/page.tsx`:
    ```typescript
    import { redirect } from 'next/navigation'
    import { createClient } from '@/lib/supabase/server'
    import { CommunityList } from '@/components/communities/CommunityList'

    export default async function CommunitiesPage() {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) redirect('/login')

      // Obtener comunidades del usuario con memberCount
      const { data: communities, error } = await supabase
        .from('communities')
        .select(`
          id,
          name,
          slug,
          description,
          image_url,
          created_at,
          community_members!inner(user_id)
        `)
        .eq('community_members.user_id', user.id)

      if (error) {
        // Log del error, mostrar empty state
        console.error('Error fetching communities:', error)
      }

      const communityList = communities ?? []

      // AC-5: Redirect automático si el usuario pertenece a exactamente 1 comunidad
      if (communityList.length === 1) {
        redirect(`/communities/${communityList[0].slug}`)
      }

      return <CommunityList communities={communityList} />
    }
    ```
  - [ ] Si el usuario no tiene comunidades: mostrar empty state existente con CTAs "Crear comunidad" y "Usar link de invitación" (reutilizar componente de story 2.1)

- [x] **T6: Componente `CommunityList`** (AC: 4)
  - [ ] Crear `components/communities/CommunityList.tsx`:
    - Props: `{ communities: Community[] }`
    - Renderiza grid de `CommunityCard` componentes
    - Usa tokens CSS del design system (no colores hardcodeados)
    - Grid responsivo: 1 columna en móvil, 2 en tablet, 3 en desktop (desktop-first)
  - [ ] Crear `components/communities/CommunityCard.tsx`:
    - Props: `{ community: Community }`
    - Muestra: nombre, descripción (2 líneas max con `line-clamp-2`), imagen (con fallback a avatar con inicial), número de miembros
    - Fallback de imagen: `<div>` con inicial del nombre, usando `--color-accent` como fondo
    - Link wrapping toda la card hacia `/communities/[slug]`
    - Hover state: sombra sutil y transición suave
    - Usa `next/image` para imagen si existe (con `remotePatterns` configurado en `next.config.ts`)
    - Tokens de color a usar: `--color-surface` (fondo card), `--color-border` (borde), `--color-text-primary` (nombre), `--color-text-secondary` (descripción), `--color-text-muted` (memberCount)

- [x] **T7: Página `/communities/[slug]` — layout base de comunidad** (AC: 2, 8)
  - [ ] Editar o crear `app/communities/[slug]/page.tsx`:
    ```typescript
    import { redirect } from 'next/navigation'
    import { createClient } from '@/lib/supabase/server'
    import { notFound } from 'next/navigation'

    interface Props {
      params: Promise<{ slug: string }>
    }

    export default async function CommunityPage({ params }: Props) {
      const { slug } = await params
      const supabase = await createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) redirect('/login')

      // RLS garantiza que solo miembros pueden leer — si no es miembro, data será null
      const { data: community } = await supabase
        .from('communities')
        .select('id, name, slug, description, image_url, created_at')
        .eq('slug', slug)
        .single()

      // AC-2: Si no hay acceso (no miembro o no existe) → redirect a /communities con mensaje
      if (!community) {
        redirect('/communities?error=no-access')
      }

      return (
        <div>
          {/* Layout base de comunidad — placeholder para Epic 3 */}
          <CommunityHeader community={community} />
          {/* Proyectos se añaden en story 3.4 */}
          <div className="mt-8">
            <p className="text-muted">Los proyectos de esta comunidad aparecerán aquí.</p>
          </div>
        </div>
      )
    }
    ```
  - [ ] Crear `components/communities/CommunityHeader.tsx`:
    - Muestra: imagen de comunidad (con fallback), nombre (h1), descripción, número de miembros
    - Botón "Configuración" visible solo para admins (verificar rol del usuario en community_members)
    - Tokens de color del design system

- [x] **T8: Manejo del parámetro `?error=no-access` en `/communities`** (AC: 2)
  - [ ] Editar `app/communities/page.tsx` — leer `searchParams` y mostrar toast/banner si `error=no-access`:
    ```typescript
    interface Props {
      searchParams: Promise<{ error?: string }>
    }

    export default async function CommunitiesPage({ searchParams }: Props) {
      const { error } = await searchParams
      // ...
      return (
        <div>
          {error === 'no-access' && (
            <div role="alert" className="...">
              No tienes acceso a esta comunidad.
            </div>
          )}
          <CommunityList communities={communityList} />
        </div>
      )
    }
    ```
  - [ ] El banner de error usa color semántico (no hardcodeado): fondo `--color-hypothesis-bg`, borde `--color-hypothesis-border`

- [x] **T9: Navbar — selector de comunidad activa** (AC: 6)
  - [ ] Identificar el componente de Navbar existente en el proyecto (probablemente `components/shared/Navbar.tsx` o layout principal)
  - [ ] Editar Navbar para añadir selector de comunidad:
    - Condición: solo se muestra si el usuario pertenece a 2 o más comunidades
    - Si el usuario está en `/communities/[slug]`: la comunidad activa aparece destacada en el dropdown
    - Si el usuario está en `/communities` (listado): dropdown sin selección activa
    - Componente `CommunitySwitcher` (dropdown shadcn/ui `DropdownMenu`):
      - Lista todas las comunidades del usuario
      - Comunidad activa marcada con checkmark o bold
      - Click en una comunidad → `router.push('/communities/[slug]')`
      - Si solo hay 1 comunidad: no mostrar dropdown, mostrar nombre de la comunidad como texto plano en Navbar
  - [ ] Crear `components/communities/CommunitySwitcher.tsx` (Client Component):
    - Props: `{ communities: Community[], activeCommunitySlug?: string }`
    - Usa `DropdownMenu` de shadcn/ui
    - Usa `useRouter` de next/navigation para navegación
  - [ ] Pasar las comunidades del usuario al layout a través de un Server Component padre (no fetch en Client Component)

- [x] **T10: Tests unitarios** (AC: 1, 2, 5, 7)
  - [ ] Crear `tests/unit/communities/communitiesListing.test.ts`:
    - Test: `GET /api/communities` devuelve solo las comunidades del usuario autenticado
    - Test: `GET /api/communities` incluye `memberCount` en cada comunidad
    - Test: `GET /api/communities` con usuario sin comunidades devuelve `{ data: [], count: 0 }`
    - Test: `GET /api/communities` sin autenticación devuelve 401
    - Test: `GET /api/communities/[slug]` — comunidad existente y usuario miembro → 200 con datos
    - Test: verificar que el mapping `snake_case → camelCase` es correcto (`image_url → imageUrl`, etc.)
  - [ ] Añadir test en `tests/unit/communities/` para el redirect automático (AC-5):
    - Test: si el usuario tiene 1 comunidad, `/communities` redirige a `/communities/[slug]`
    - Test: si el usuario tiene 0 o 2+ comunidades, no hay redirect automático
  - [ ] Actualizar `docs/project/modules/communities.md` con el comportamiento de story 2.3

- [x] **T11: Actualizar `docs/project/modules/communities.md`** (AC: 1-8)
  - [ ] Añadir sección de story 2.3 al módulo communities.md:
    - Reglas de comportamiento nuevas (listing, redirect automático, acceso por URL, navbar selector)
    - Ficheros clave nuevos o modificados
    - Fecha de actualización: Story 2.3

## Dev Notes

### Patrones arquitectónicos obligatorios

- **Supabase access pattern**: Server Components (`app/communities/`) usan `createClient()` de `lib/supabase/server.ts` directamente. Client Components (`CommunitySwitcher`) NO acceden a Supabase — reciben datos como props desde Server Components padre.
- **Auth en API Routes**: `supabase.auth.getUser()` obligatorio (nunca `getSession()`). Ver pattern en `app/api/communities/route.ts` (story 2.1).
- **Doble filtro por membresía**: RLS (nivel BD) + filtro explícito en API Route (nivel aplicación). Mismo patrón que CR2-F2 en story 2.1.
- **Mutaciones via API Route**: el botón "Configuración" de admin en `CommunityHeader` DEBE disparar acciones via API Route, nunca Server Actions. (Rejection Criterion heredado de story 2.1.)
- **Mapeo snake_case → camelCase**: toda respuesta de API Route debe mapear campos de BD. Usar patrón existente de `app/api/communities/route.ts`.

### Tokens de diseño a usar

Todos los colores DEBEN ser tokens CSS — no valores hexadecimales hardcodeados:
- Fondo general: `--color-background` (`#FAFAF8`)
- Cards/paneles: `--color-surface` (`#FFFFFF`)
- Bordes: `--color-border` (`#E5E5E0`)
- Texto principal: `--color-text-primary` (`#1A1A18`)
- Texto secundario: `--color-text-secondary` (`#6B6B63`)
- Texto muted (memberCount): `--color-text-muted` (`#9B9B8F`)
- Accent (fallback avatar, CTA): `--color-accent` (`#E87D4A`)
- Banner error/acceso: `--color-hypothesis-bg` (`#FDF0E8`), `--color-hypothesis-border` (`#F0C9A8`)

### Estructura de ficheros a tocar

```
app/
  communities/
    page.tsx                    ← editar (Server Component, listing + redirect lógica + error banner)
    [slug]/
      page.tsx                  ← editar/crear (Server Component, layout base + acceso check)

app/api/
  communities/
    route.ts                    ← editar (GET — añadir memberCount al response)

components/
  communities/
    CommunityList.tsx           ← crear (grid de cards)
    CommunityCard.tsx           ← crear (card individual con imagen, nombre, desc, memberCount)
    CommunityHeader.tsx         ← crear (header de comunidad: imagen, nombre, desc, miembros, settings CTA)
    CommunitySwitcher.tsx       ← crear (Client Component — dropdown navbar)

lib/
  types/
    communities.ts              ← editar (añadir memberCount al tipo Community)

supabase/
  migrations/
    006_rls_communities_member_access.sql  ← crear

tests/
  unit/
    communities/
      communitiesListing.test.ts  ← crear

docs/
  project/
    modules/
      communities.md            ← actualizar (añadir comportamiento story 2.3)
```

### Consideraciones de RLS y seguridad

- La policy RLS `members_read_own_community` en `communities` es la frontera de seguridad principal — si falla, un usuario podría ver comunidades a las que no pertenece (NFR-S3, NFR-S4).
- Antes de crear la migración, verificar con `supabase migration list` qué policies existen actualmente para `communities` y si deben actualizarse o reemplazarse.
- El nombre exacto de la policy existente en stories anteriores puede diferir — hacer `SELECT * FROM pg_policies WHERE tablename = 'communities'` para confirmar.
- El check de acceso en `app/communities/[slug]/page.tsx` aprovecha RLS implícitamente: si el usuario no es miembro, Supabase devuelve `null` y se redirige — NO se necesita un query separado de membership check en este caso concreto (RLS hace el trabajo).

### Redirect automático — AC-5

El redirect desde `/communities` → `/communities/[slug]` cuando hay exactamente 1 comunidad debe ocurrir ANTES de renderizar cualquier UI (en el Server Component, antes del return). Usar `redirect()` de `next/navigation`. No es un redirect cliente-side.

### Navbar — CommunitySwitcher

- El componente `CommunitySwitcher` es un Client Component (necesita `useRouter` y estado de dropdown interactivo).
- Las comunidades del usuario se obtienen en un Server Component padre (layout o página) y se pasan como props.
- Si el layout principal (`app/layout.tsx` o un layout de grupo) ya tiene acceso al usuario, es el lugar natural para obtener las comunidades y pasarlas al Navbar/CommunitySwitcher.
- Componente shadcn/ui a usar: `DropdownMenu` (ya instalado desde story 2.1/2.2).

### Testing

- Framework: Vitest para tests unitarios de API Routes y lógica.
- Patrón de mocking de Supabase: seguir el patrón existente en `tests/unit/communities/` (stories 2.1 y 2.2).
- Los componentes React (`CommunityCard`, `CommunityList`, `CommunitySwitcher`) NO requieren tests unitarios en esta story — la cobertura es por los tests de API Route y lógica de negocio.
- El redirect automático (AC-5) se testea a nivel de lógica (array.length === 1 → redirect), no a nivel E2E en esta story.

### Referencias

- Arquitectura — Supabase access pattern: [Source: `_bmad-output/planning-artifacts/architecture.md`#Supabase access — regla de oro]
- Arquitectura — Auth en API Routes: [Source: `_bmad-output/planning-artifacts/architecture.md`#Auth en API Routes — patrón obligatorio]
- Arquitectura — Community membership check: [Source: `_bmad-output/planning-artifacts/architecture.md`#Community membership check — patrón obligatorio]
- Arquitectura — API Response format: [Source: `_bmad-output/planning-artifacts/architecture.md`#Format Patterns]
- Arquitectura — Naming patterns: [Source: `_bmad-output/planning-artifacts/architecture.md`#Naming Patterns]
- Design tokens: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md`#Design System]
- Módulo communities (comportamiento stories anteriores): [Source: `docs/project/modules/communities.md`]
- Story 2.1 (doble filtro membresía, CR2-F2): [Source: `_bmad-output/implementation-artifacts/stories/2-1-create-community.md`]
- Epic 2 ACs originales: [Source: `_bmad-output/planning-artifacts/epic-2-comunidades.md`#Story 2.3]
- PRD FR8 (aislamiento de comunidad): [Source: `_bmad-output/planning-artifacts/prd.md`]

### Project Structure Notes

- La estructura `app/communities/[slug]/page.tsx` sigue la convención App Router establecida en architecture.md (`app/(app)/communities/[id]/`). Si existe un route group `(app)/`, la ruta real puede ser `app/(app)/communities/[slug]/page.tsx` — verificar la estructura actual antes de crear ficheros.
- `CommunitySwitcher` es un Client Component cross-dominio pero pertenece semánticamente a `communities` → ubicar en `components/communities/CommunitySwitcher.tsx`, no en `components/shared/`.
- Si el proyecto ya tiene un Navbar en `components/shared/Navbar.tsx`, editar ese fichero para integrar `CommunitySwitcher`.

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

ds-20260328-014, ds-20260328-016 (CR5 fixes)

### Completion Notes List

- CR5-F1: JSDoc corregido en lib/types/communities.ts — ahora documenta correctamente que el tipo usa snake_case internamente y que la API Route mapea a camelCase en la respuesta JSON.
- CR5-F2: Comentario en page.tsx línea 60 corregido — eliminado "Mapear snake_case → camelCase" (engañoso) y sustituido por comentario preciso que indica que los campos permanecen en snake_case.
- CR5-F3: color '#FFFFFF' hardcodeado reemplazado por 'var(--color-surface)' en CommunityCard.tsx y CommunityHeader.tsx. --color-surface mapea a #FFFFFF en el design system y es el token correcto para texto sobre fondo accent.
- CR5-F4: Promise.all implementado en [slug]/page.tsx — memberCount e isAdmin se obtienen en paralelo (queries independientes).
- CR5-F5: Doble fetch eliminado — creado lib/queries/communities.ts con getUserCommunities() memoizada con React.cache. Layout.tsx y page.tsx usan la misma función; el segundo llamante en el mismo request no genera fetch adicional.
- CR5-F6: CommunitySwitcherClient regex corregido — array RESERVED_SLUGS=['new'] excluye explícitamente rutas reservadas. /communities/new no captura "new" como slug activo.
- CR5-F7: getUser() error destructuring aplicado en [slug]/page.tsx, page.tsx y layout.tsx — ahora se comprueba authError además de !user (patrón: const { data: authData, error: authError } = await supabase.auth.getUser(); if (authError || !authData.user) redirect('/login')).
- T1: Branch feat/2-3-community-access-control-listing creada desde develop.
- T2: Migration 006_rls_communities_member_access.sql — DROP + CREATE POLICY con EXISTS en lugar de IN (más eficiente).
- T3: Community type extendido con member_count (snake_case, consistente con el resto de campos del tipo).
- T4: GET /api/communities actualizado con query de comunidades + query separada de memberCounts + mapeo camelCase. Devuelve { data, count }.
- T5+T8: CommunitiesPage reescrita con redirect a /login, filtro explícito de membresía, redirect automático (AC-5), banner ?error=no-access.
- T6: CommunityList (grid responsive) y CommunityCard (imagen/fallback, nombre, descripción 2 líneas, memberCount) creados.
- T7: [slug]/page.tsx creado — RLS como access gate, redirect /communities?error=no-access si null. CommunityHeader con isAdmin prop.
- T9: CommunitySwitcher (Client Component con DropdownMenu), CommunitySwitcherClient (lee pathname para slug activo), layout.tsx para el grupo /communities con Navbar.
- T10: 17 tests unitarios en communitiesListing.test.ts — todos pasan. Total suite: 84/84.
- T11: docs/project/modules/communities.md actualizado con reglas de story 2.3.
- No se encontró Navbar existente — se creó layout.tsx en app/(app)/communities/ como punto de integración.
- La property del tipo Community permanece en snake_case (member_count) para consistencia con el tipo existente. La API Route mapea a camelCase en la respuesta.

### File List

- `lib/queries/communities.ts` — CREATED (getUserCommunities con React.cache — CR5-F5)
- `supabase/migrations/006_rls_communities_member_access.sql` — CREATED
- `lib/types/communities.ts` — MODIFIED (member_count field)
- `app/api/communities/route.ts` — MODIFIED (memberCount query + camelCase mapping)
- `app/(app)/communities/page.tsx` — MODIFIED (redirect logic + error banner)
- `app/(app)/communities/[slug]/page.tsx` — CREATED
- `app/(app)/communities/layout.tsx` — CREATED
- `components/communities/CommunityList.tsx` — CREATED
- `components/communities/CommunityCard.tsx` — CREATED
- `components/communities/CommunityHeader.tsx` — CREATED
- `components/communities/CommunitySwitcher.tsx` — CREATED
- `components/communities/CommunitySwitcherClient.tsx` — CREATED
- `tests/unit/communities/communitiesListing.test.ts` — CREATED
- `docs/project/modules/communities.md` — MODIFIED
