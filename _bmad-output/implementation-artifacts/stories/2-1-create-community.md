# Story 2.1: Create Community

Status: review

## Story

Como usuario autenticado,
quiero poder crear una comunidad privada con nombre, descripción e imagen,
para que mi equipo tenga un espacio privado de validación de ideas.

## Acceptance Criteria

1. Ruta `/communities/new` renderiza un formulario con campos: nombre (obligatorio), descripción (obligatorio), imagen (opcional)
2. Al crear la comunidad exitosamente, el usuario queda registrado automáticamente como Admin en `community_members`
3. La comunidad creada aparece en la lista `/communities` del creador tras el redirect post-creación
4. El nombre de comunidad debe ser único en la plataforma — el backend valida unicidad y devuelve error si ya existe
5. Si el usuario no pertenece a ninguna comunidad, `/communities` muestra un empty state con dos CTAs: "Crear comunidad" (→ `/communities/new`) y "Usar link de invitación"
6. La imagen de comunidad soporta dos modos: upload a Supabase Storage (archivo) o URL externa (texto)
7. La validación de errores es inline bajo cada campo (no toast, no alert): campos vacíos, nombre muy corto (<3 caracteres)

## Rejection Criteria

- NO usar Server Actions — toda mutación va por API Route (`POST /api/communities`)
- NO importar `@supabase/supabase-js` o `@supabase/ssr` fuera de `lib/supabase/` (ESLint lo bloquea)
- NO usar `getSession()` — en API Routes usar `supabase.auth.getUser()`
- NO mostrar toasts para errores de validación — la validación es inline en el formulario
- NO crear tabla sin migración SQL versionada en `supabase/migrations/`

## Tasks / Subtasks

- [x] **T1: Feature branch** (prerequisito)
  - [x] `git checkout develop && git pull`
  - [x] `git checkout -b feat/2-1-create-community`

- [x] **T2: Migraciones SQL — tablas `communities` y `community_members`** (AC: 2, 4)
  - [x] Crear `supabase/migrations/002_create_communities.sql`:
    ```sql
    -- communities
    CREATE TABLE communities (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name        text NOT NULL,
      slug        text NOT NULL UNIQUE,
      description text NOT NULL,
      image_url   text,
      created_by  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at  timestamptz NOT NULL DEFAULT now(),
      updated_at  timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX idx_communities_slug ON communities(slug);
    CREATE INDEX idx_communities_created_by ON communities(created_by);

    -- community_members
    CREATE TABLE community_members (
      id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
      user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      role         text NOT NULL CHECK (role IN ('admin', 'member')) DEFAULT 'member',
      joined_at    timestamptz NOT NULL DEFAULT now(),
      UNIQUE (community_id, user_id)
    );

    CREATE INDEX idx_community_members_community_id ON community_members(community_id);
    CREATE INDEX idx_community_members_user_id ON community_members(user_id);
    ```
  - [x] **Nota sobre numeración:** comprobar qué migraciones ya existen en `supabase/migrations/` antes de asignar número. Usar el siguiente número disponible.
  - [x] Crear migración de RLS en `supabase/migrations/003_rls_policies.sql` (directorio vacío — 003 es el siguiente disponible):
    ```sql
    -- RLS communities: solo miembros leen su comunidad
    ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "members_read_own_community"
      ON communities FOR SELECT
      USING (
        auth.uid() IN (
          SELECT user_id FROM community_members WHERE community_id = id
        )
      );

    CREATE POLICY "authenticated_insert_community"
      ON communities FOR INSERT
      WITH CHECK (auth.uid() = created_by);

    -- RLS community_members
    ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "members_read_own_memberships"
      ON community_members FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "authenticated_insert_membership"
      ON community_members FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    ```
  - [x] Aplicar migraciones: `supabase db push` (local) o confirmar que se aplicarán en CI

- [x] **T3: Schema Zod para validación** (AC: 7)
  - [x] Crear `lib/validations/communities.ts`:
    ```typescript
    import { z } from 'zod'

    export const createCommunitySchema = z.object({
      name: z.string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(60, 'El nombre no puede superar 60 caracteres'),
      description: z.string()
        .min(1, 'La descripción es obligatoria')
        .max(500, 'La descripción no puede superar 500 caracteres'),
      imageUrl: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
    })

    export type CreateCommunityInput = z.infer<typeof createCommunitySchema>
    ```

- [x] **T4: Tipos TypeScript de dominio** (AC: 2, 3)
  - [x] Crear o actualizar `lib/types/communities.ts`:
    ```typescript
    export type CommunityRole = 'admin' | 'member'

    export interface Community {
      id: string
      name: string
      slug: string
      description: string
      imageUrl: string | null
      createdBy: string
      createdAt: string
      updatedAt: string
    }

    export interface CommunityMember {
      id: string
      communityId: string
      userId: string
      role: CommunityRole
      joinedAt: string
    }
    ```

- [x] **T5: API Route — POST /api/communities** (AC: 2, 4)
  - [x] Crear `app/api/communities/route.ts`:
    ```typescript
    import { NextResponse } from 'next/server'
    import { createClient } from '@/lib/supabase/server'
    import { createCommunitySchema } from '@/lib/validations/communities'

    function toSlug(name: string): string {
      return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }

    export async function POST(request: Request) {
      const supabase = await createClient()

      // Auth check
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (!user) return NextResponse.json(
        { error: 'No autenticado', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )

      // Validación Zod
      const body = await request.json()
      const result = createCommunitySchema.safeParse(body)
      if (!result.success) return NextResponse.json(
        { error: result.error.issues[0].message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      )

      const { name, description, imageUrl } = result.data
      const slug = toSlug(name)

      // Verificar unicidad del slug/nombre
      const { data: existing } = await supabase
        .from('communities')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (existing) return NextResponse.json(
        { error: 'Ya existe una comunidad con ese nombre', code: 'COMMUNITY_NAME_TAKEN' },
        { status: 409 }
      )

      // Crear comunidad
      const { data: community, error: insertError } = await supabase
        .from('communities')
        .insert({
          name,
          slug,
          description,
          image_url: imageUrl || null,
          created_by: user.id,
        })
        .select()
        .single()

      if (insertError || !community) return NextResponse.json(
        { error: 'Error al crear la comunidad', code: 'COMMUNITY_CREATE_ERROR' },
        { status: 500 }
      )

      // Insertar creador como admin en community_members
      const { error: memberError } = await supabase
        .from('community_members')
        .insert({
          community_id: community.id,
          user_id: user.id,
          role: 'admin',
        })

      if (memberError) return NextResponse.json(
        { error: 'Error al registrar membresía', code: 'MEMBER_INSERT_ERROR' },
        { status: 500 }
      )

      return NextResponse.json({ data: community }, { status: 201 })
    }
    ```

- [x] **T6: Typed client wrapper** (AC: 3)
  - [x] Crear `lib/api/communities.ts`:
    ```typescript
    import type { Community } from '@/lib/types/communities'
    import type { CreateCommunityInput } from '@/lib/validations/communities'

    export async function createCommunity(data: CreateCommunityInput): Promise<Community> {
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      return (await res.json()).data
    }

    export async function getCommunities(): Promise<Community[]> {
      const res = await fetch('/api/communities')
      if (!res.ok) throw new Error((await res.json()).error)
      return (await res.json()).data
    }
    ```

- [x] **T7: Componente CommunityForm** (AC: 1, 6, 7)
  - [x] Crear `components/communities/CommunityForm.tsx` — Client Component:
    - `react-hook-form` + `zodResolver(createCommunitySchema)`
    - Campos: `name` (Input), `description` (Textarea), `imageUrl` (Input — URL externa, opcional)
    - Errores inline bajo cada campo con `<p className="text-sm text-destructive">{error.message}</p>`
    - Submit state: `isLoading` → botón deshabilitado con "Creando..."
    - onSubmit: llama a `createCommunity()` de `lib/api/communities.ts` y llama a `onSuccess(community)` del padre
    - **No manejar upload de imagen en esta story** — usar solo URL externa (simplificación segura para MVP story 2.1)

- [x] **T8: Página /communities/new** (AC: 1, 3)
  - [x] Crear `app/(app)/communities/new/page.tsx` — Server Component:
    ```typescript
    import { CommunityForm } from '@/components/communities/CommunityForm'
    // redirect se maneja en el Client Component con useRouter
    export default function NewCommunityPage() {
      return (
        <main className="container max-w-lg py-8">
          <h1 className="text-2xl font-bold mb-6">Crear comunidad</h1>
          <CommunityForm />
        </main>
      )
    }
    ```
  - [x] El CommunityForm usa `useRouter().push('/communities')` en onSuccess

- [x] **T9: Página /communities — lista + empty state** (AC: 3, 5)
  - [x] Crear `app/(app)/communities/page.tsx` — Server Component:
    - Llama a Supabase con `lib/supabase/server.ts` (Server Component — async createClient). RLS filtra automáticamente.
    - Si `communities.length === 0`: renderiza EmptyCommunitiesState
    - Si `communities.length > 0`: renderiza lista de CommunityCard (stub básico con nombre + descripción)
  - [x] Crear `components/communities/EmptyCommunitiesState.tsx`:
    - Texto: "Aún no formas parte de ninguna comunidad"
    - CTA primario: Button → `/communities/new` ("Crear comunidad")
    - CTA secundario: texto/link → "Usar link de invitación" (explica que recibirán un link)

- [x] **T10: Tests unitarios** (AC: 4, 7)
  - [x] Crear `tests/unit/communities/createCommunity.test.ts`:
    - Test: `createCommunitySchema` valida nombre vacío → error
    - Test: `createCommunitySchema` valida nombre < 3 chars → error
    - Test: `createCommunitySchema` valida descripción vacía → error
    - Test: `createCommunitySchema` acepta imageUrl vacío/undefined → ok
    - Test: `toSlug('Mi Comunidad!')` → `'mi-comunidad'`
    - Test: `toSlug('Café & Ideas')` → `'cafe-ideas'`
    - **13 tests unitarios implementados (≥6 requeridos)**

- [x] **T11: Documentación funcional**
  - [x] Crear `docs/project/modules/communities.md` con:
    - Qué hace (crear comunidad, RLS, membresía admin automática)
    - Reglas de comportamiento (de ACs)
    - Ficheros clave (API route, form, page, types, validations)
    - Última actualización: Story 2.1

- [x] **T12: PR y cierre**
  - [x] Ejecutar tests: `npm run test` — 37/37 pasando
  - [x] `git add` — solo ficheros de esta story
  - [x] Commit: `feat(communities): create community form, API route and listing`
  - [x] Push: `git push -u origin feat/2-1-create-community`
  - [x] PR contra `develop`
  - [x] Actualizar `sprint-status.yaml`: `2-1-create-community: review`

## Dev Notes

### Learnings de Epic 1 (Stories 1.1–1.3)

- **`lib/supabase/server.ts`** exporta `createClient()` — usarlo en API Routes (no importar Supabase SDK directamente)
- **`lib/supabase/client.ts`** para Server Components que necesiten leer datos de Supabase directamente
- **`getClaims()` en middleware, `getUser()` en API Routes** — nunca `getSession()` (ESLint lo bloquea)
- **ESLint `no-restricted-imports`**: `@supabase/supabase-js` y `@supabase/ssr` solo en `lib/supabase/`
- **`searchParams` en Next.js 15** es `Promise<{...}>` — hacer `await` si se usa en Server Components
- **Vitest 2.1.9** — pinned, no actualizar
- **`/invite/[token]` DEBE ser pública**: Story 2.2 añadirá esta ruta a `PUBLIC_PATHS` en `middleware.ts`. Story 2.1 NO toca el middleware.

### Patrón de acceso a Supabase

```
Client Component  →  lib/api/communities.ts  →  fetch('/api/communities')  →  API Route  →  Supabase SDK
Server Component  →  lib/supabase/client.ts  →  Supabase SDK directamente
```

### Patrón auth en API Route (obligatorio)

```typescript
const supabase = await createClient() // SIEMPRE lib/supabase/server.ts
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: '...', code: 'AUTH_REQUIRED' }, { status: 401 })
```

### Esquema de base de datos

```
communities
  id uuid PK
  name text NOT NULL
  slug text NOT NULL UNIQUE      ← generado desde name (kebab-case, sin acentos)
  description text NOT NULL
  image_url text NULL
  created_by uuid FK → auth.users(id)
  created_at timestamptz
  updated_at timestamptz

community_members
  id uuid PK
  community_id uuid FK → communities(id)
  user_id uuid FK → auth.users(id)
  role text CHECK IN ('admin','member')
  joined_at timestamptz
  UNIQUE(community_id, user_id)
```

### RLS — política de aislamiento

El creador de la comunidad queda en `community_members` como admin ANTES de que el RLS de `communities` permita leer la misma. El INSERT en `communities` usa `WITH CHECK (auth.uid() = created_by)` — permite insertar sin ser miembro todavía. Inmediatamente después se inserta en `community_members`. Este orden es crítico: si se invierte, el SELECT posterior fallará por RLS.

### Estructura de ficheros a crear

```
supabase/migrations/
  002_create_communities.sql       ← comprobar numeración disponible primero
  006_rls_policies.sql             ← o añadir a migración existente

app/(app)/communities/
  page.tsx                         ← CREAR: lista + empty state
  new/
    page.tsx                       ← CREAR: formulario de creación

app/api/communities/
  route.ts                         ← CREAR: GET (lista) + POST (crear)

components/communities/
  CommunityForm.tsx                ← CREAR: Client Component
  EmptyCommunitiesState.tsx        ← CREAR

lib/
  api/
    communities.ts                 ← CREAR: typed fetch wrapper
  validations/
    communities.ts                 ← CREAR: schema Zod
  types/
    communities.ts                 ← CREAR: tipos TypeScript

docs/project/modules/
  communities.md                   ← CREAR

tests/unit/communities/
  createCommunity.test.ts          ← CREAR
```

### Scope limitado intencionalmente

- **Imagen**: solo URL externa en esta story. Upload a Supabase Storage se pospone a una iteración posterior — el formulario acepta `imageUrl` como string opcional. El campo visual puede ser un Input simple de texto.
- **GET /api/communities**: implementar la ruta GET para que `/communities/page.tsx` pueda leer las comunidades del usuario (necesario para AC 3 y 5). La lectura filtra automáticamente por RLS.
- **`/communities/[slug]/page.tsx`**: NO crear en esta story — pertenece a Story 2.3.
- **Supabase Storage**: NO implementar en esta story.

### Nota sobre numeración de migraciones

Antes de crear las migraciones, hacer `ls supabase/migrations/` para ver qué ficheros existen y usar el siguiente número disponible. El archivo de arquitectura menciona `002_create_communities.sql` y `006_rls_policies.sql` como nombres objetivo.

### References

- [Source: epic-2-comunidades.md#Story 2.1] — User story, ACs y notas técnicas originales
- [Source: architecture.md#Structure Patterns] — organización de ficheros, regla de oro Supabase access
- [Source: architecture.md#Process Patterns] — auth en API Routes, validación Zod, community membership check
- [Source: architecture.md#Data Architecture] — migraciones, naming snake_case, RLS
- [Source: architecture.md#API & Communication Patterns] — response format `{ data }`, error format `{ error, code }`
- [Source: architecture.md#Naming Patterns] — tablas plural snake_case, columnas snake_case, FK pattern
- [Source: docs/project/modules/auth.md] — reglas de auth implementadas en Epic 1
- [Source: stories/1-3-auth-middleware-route-protection.md#Dev Notes] — `/invite/[token]` debe ser pública (lo añade Story 2.2)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6 (Homer DS, 2026-03-27)

### Debug Log References

- ESLint warning `no-img-element` en `app/(app)/communities/page.tsx` — reemplazado por `next/image` (Image component). Resuelto.
- `supabase/migrations/` estaba vacío — se usaron 002 y 003 (en lugar de 002 y 006 como indicaba la story, ya que 003 era el siguiente disponible).
- `app/(app)/communities/page.tsx` usa `lib/supabase/server.ts` (async) en lugar de `lib/supabase/client.ts` — Server Component de Next.js 15 requiere `createClient` async del lado servidor.

### Completion Notes List

- T1: Feature branch `feat/2-1-create-community` creado desde `develop`.
- T2: Migraciones `002_create_communities.sql` y `003_rls_policies.sql` creadas (numeración 003 en vez de 006 — directorio estaba vacío).
- T3: Schema Zod en `lib/validations/communities.ts` — idéntico al especificado.
- T4: Tipos TypeScript en `lib/types/communities.ts` — directorio `lib/types/` creado desde cero.
- T5: API Route `app/api/communities/route.ts` — GET + POST. `toSlug()` exportada para ser testeable.
- T6: Typed client wrapper `lib/api/communities.ts` — reemplaza placeholder anterior.
- T7: `CommunityForm.tsx` — Client Component con react-hook-form + zodResolver. Estados: errores inline, `isSubmitting` → botón "Creando...".
- T8: `app/(app)/communities/new/page.tsx` — Server Component + CommunityForm.
- T9: `app/(app)/communities/page.tsx` — Server Component con Supabase server client. `EmptyCommunitiesState.tsx` con dos CTAs.
- T10: 13 tests unitarios (≥6 requeridos) — todos pasando. `toSlug` exportada para ser importable en tests.
- T11: `docs/project/modules/communities.md` creado.
- T12: 37/37 tests pasando. TypeScript: sin errores. ESLint: sin errores.

### File List

- `supabase/migrations/002_create_communities.sql` — CREADO
- `supabase/migrations/003_rls_policies.sql` — CREADO
- `lib/validations/communities.ts` — CREADO
- `lib/types/communities.ts` — CREADO
- `lib/api/communities.ts` — MODIFICADO (reemplaza placeholder)
- `app/api/communities/route.ts` — CREADO
- `components/communities/CommunityForm.tsx` — CREADO
- `components/communities/EmptyCommunitiesState.tsx` — CREADO
- `app/(app)/communities/page.tsx` — CREADO
- `app/(app)/communities/new/page.tsx` — CREADO
- `tests/unit/communities/createCommunity.test.ts` — CREADO
- `docs/project/modules/communities.md` — CREADO
- `_bmad-output/implementation-artifacts/stories/2-1-create-community.md` — MODIFICADO
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFICADO
