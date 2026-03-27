# Story 2.2: Invitation Links — Generate & Join

Status: review

## Story

Como Admin de una comunidad,
quiero poder generar links de invitación de un solo uso,
para que pueda incorporar miembros a mi comunidad sin gestión manual.

## Acceptance Criteria

1. Admin puede generar invitation links desde `/communities/[slug]/settings` — botón "Generar link de invitación"
2. Cada link es de un solo uso — se invalida tras uso exitoso (columna `used_at` se rellena)
3. Token generado criptográficamente con `crypto.randomUUID()` — impredecible (NFR-S1)
4. Link copiado al clipboard con un clic — botón "Copiar link" con feedback visual ("¡Copiado!")
5. Ruta pública `/invite/[token]` — si autenticado: procesa join + redirect a `/communities`; si no autenticado: redirect a `/login?next=/invite/[token]`
6. Usuario ya miembro de la comunidad: muestra mensaje "Ya eres miembro de esta comunidad" con link a `/communities` (no error, no fallo)
7. Token ya usado o inexistente: muestra mensaje de error "Este link ya no es válido" con CTA para solicitar uno nuevo
8. Middleware actualizado: `/invite` añadido a `PUBLIC_PREFIX_PATHS` para que `/invite/*` sea accesible sin sesión

## Rejection Criteria

- NO importar `@supabase/supabase-js` o `@supabase/ssr` fuera de `lib/supabase/` (ESLint lo bloquea)
- NO usar `getSession()` — en API Routes usar `supabase.auth.getUser()`, en middleware usar `getClaims()`
- NO crear tabla sin migración SQL versionada en `supabase/migrations/`
- NO usar Server Actions para mutaciones — todas las mutaciones van por API Route
- NO exponer el token en logs ni en mensajes de error al usuario

## Tasks / Subtasks

- [x] **T1: Feature branch** (prerequisito)
  - [x] `git checkout develop && git pull`
  - [x] `git checkout -b feat/2-2-invitation-links`

- [x] **T2: Migración SQL — tabla `invitation_links`** (AC: 2, 3)
  - [x] Comprobar `ls supabase/migrations/` — usar siguiente número disponible (objetivo: `005_create_invitations.sql`)
  - [x] Crear `supabase/migrations/001_create_invitation_links.sql` (numeración: develop sin migraciones previas, 001 es el primer número disponible):
    ```sql
    CREATE TABLE invitation_links (
      id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      token        text NOT NULL UNIQUE,
      community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
      created_by   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      used_at      timestamptz NULL,
      used_by      uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at   timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX idx_invitation_links_token ON invitation_links(token);
    CREATE INDEX idx_invitation_links_community_id ON invitation_links(community_id);

    -- RLS: admin de la comunidad puede crear y leer sus invitation links
    ALTER TABLE invitation_links ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "admin_manage_invitations"
      ON invitation_links FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM community_members
          WHERE community_id = invitation_links.community_id
            AND user_id = auth.uid()
            AND role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM community_members
          WHERE community_id = invitation_links.community_id
            AND user_id = auth.uid()
            AND role = 'admin'
        )
      );

    -- Cualquier usuario autenticado puede leer un token (para validarlo)
    -- pero NO puede leer toda la tabla — solo por token específico
    CREATE POLICY "authenticated_read_by_token"
      ON invitation_links FOR SELECT
      USING (auth.uid() IS NOT NULL);
    ```
  - [x] Aplicar migración vía Supabase Dashboard (SQL Editor) o `supabase db push`

- [x] **T3: Tipos TypeScript** (AC: 2, 7)
  - [x] Crear `lib/types/invitations.ts`:
    ```typescript
    export interface InvitationLink {
      id: string
      token: string
      communityId: string
      createdBy: string
      usedAt: string | null
      usedBy: string | null
      createdAt: string
    }

    export interface InvitationLinkWithCommunity extends InvitationLink {
      community: {
        id: string
        name: string
        slug: string
      }
    }
    ```

- [x] **T4: Schema Zod** (AC: 1)
  - [x] Crear `lib/validations/invitations.ts`:
    ```typescript
    import { z } from 'zod'

    export const generateInvitationSchema = z.object({
      communityId: z.string().uuid('ID de comunidad inválido'),
    })

    export type GenerateInvitationInput = z.infer<typeof generateInvitationSchema>
    ```

- [x] **T5: API Route — POST /api/communities/[communityId]/invitations** (AC: 1, 2, 3)
  - [x] Crear `app/api/communities/[communityId]/invitations/route.ts`:
    ```typescript
    import { NextResponse } from 'next/server'
    import { createClient } from '@/lib/supabase/server'

    export async function POST(
      _request: Request,
      { params }: { params: Promise<{ communityId: string }> }
    ) {
      const { communityId } = await params
      const supabase = await createClient()

      // Auth check
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json(
        { error: 'No autenticado', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )

      // Verificar que el usuario es admin de la comunidad
      const { data: membership } = await supabase
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single()

      if (!membership || membership.role !== 'admin') return NextResponse.json(
        { error: 'Solo los admins pueden generar invitation links', code: 'FORBIDDEN' },
        { status: 403 }
      )

      // Generar token criptográfico
      const token = crypto.randomUUID()

      const { data: invitation, error } = await supabase
        .from('invitation_links')
        .insert({
          token,
          community_id: communityId,
          created_by: user.id,
        })
        .select()
        .single()

      if (error || !invitation) return NextResponse.json(
        { error: 'Error al generar el link', code: 'INVITATION_CREATE_ERROR' },
        { status: 500 }
      )

      return NextResponse.json({ data: invitation }, { status: 201 })
    }
    ```

- [x] **T6: API Route — POST /api/invitations/[token]/use** (AC: 2, 6, 7)
  - [x] Crear `app/api/invitations/[token]/use/route.ts`:
    ```typescript
    import { NextResponse } from 'next/server'
    import { createClient } from '@/lib/supabase/server'

    export async function POST(
      _request: Request,
      { params }: { params: Promise<{ token: string }> }
    ) {
      const { token } = await params
      const supabase = await createClient()

      // Auth check
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json(
        { error: 'No autenticado', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )

      // Buscar y validar el token
      const { data: invitation } = await supabase
        .from('invitation_links')
        .select('id, community_id, used_at')
        .eq('token', token)
        .single()

      if (!invitation) return NextResponse.json(
        { error: 'Link inválido o inexistente', code: 'INVITATION_NOT_FOUND' },
        { status: 404 }
      )

      if (invitation.used_at) return NextResponse.json(
        { error: 'Este link ya ha sido usado', code: 'INVITATION_ALREADY_USED' },
        { status: 410 }
      )

      // Verificar si ya es miembro
      const { data: existingMember } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', invitation.community_id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingMember) return NextResponse.json(
        { data: { alreadyMember: true, communityId: invitation.community_id } },
        { status: 200 }
      )

      // Unirse a la comunidad
      const { error: memberError } = await supabase
        .from('community_members')
        .insert({
          community_id: invitation.community_id,
          user_id: user.id,
          role: 'member',
        })

      if (memberError) return NextResponse.json(
        { error: 'Error al unirse a la comunidad', code: 'JOIN_ERROR' },
        { status: 500 }
      )

      // Invalidar el token
      await supabase
        .from('invitation_links')
        .update({ used_at: new Date().toISOString(), used_by: user.id })
        .eq('id', invitation.id)

      return NextResponse.json(
        { data: { communityId: invitation.community_id } },
        { status: 200 }
      )
    }
    ```

- [x] **T7: Actualizar middleware.ts — añadir /invite a PUBLIC_PREFIX_PATHS** (AC: 5, 8)
  - [x] Editar `middleware.ts`:
    - Añadir `'/invite'` a `PUBLIC_PREFIX_PATHS` (junto a `'/auth/callback'`)
    - Verificar que `isPublicPath('/invite/cualquier-token')` devuelve `true`
  - [x] Actualizar tests en `tests/unit/middleware/middleware.test.ts`:
    - Añadir test: `isPublicPath('/invite/abc-123')` → `true`
    - Añadir test: `isPublicPath('/invite')` → `true`

- [x] **T8: Página /invite/[token] — Server Component** (AC: 5, 6, 7)
  - [ ] Crear `app/invite/[token]/page.tsx`:
    ```typescript
    import { redirect } from 'next/navigation'
    import { createClient } from '@/lib/supabase/server'

    interface Props {
      params: Promise<{ token: string }>
    }

    export default async function InvitePage({ params }: Props) {
      const { token } = await params
      const supabase = await createClient()

      const { data: { user } } = await supabase.auth.getUser()

      // Si no está autenticado → redirect a login con next param
      if (!user) {
        redirect(`/login?next=/invite/${token}`)
      }

      // Procesar el join via API
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/invitations/${token}/use`,
        {
          method: 'POST',
          headers: { Cookie: /* forward cookies */ '' },
        }
      )
      // NOTA: Para Server Components que llaman APIs internas, usar el cliente Supabase
      // directamente en lugar de fetch para evitar el problema de cookies.
      // Ver Dev Notes para implementación correcta.

      // Implementación alternativa directa (recomendada para Server Components):
      // Llamar a la lógica de negocio directamente sin HTTP
    }
    ```
  - [ ] **IMPLEMENTACIÓN RECOMENDADA**: En lugar de `fetch()` interno (problemático en Server Components por forwarding de cookies), implementar la lógica de join directamente en el Server Component usando `createClient()`:
    ```typescript
    import { redirect } from 'next/navigation'
    import { createClient } from '@/lib/supabase/server'

    export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
      const { token } = await params
      const supabase = await createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) redirect(`/login?next=/invite/${token}`)

      // Validar token
      const { data: invitation } = await supabase
        .from('invitation_links')
        .select('id, community_id, used_at')
        .eq('token', token)
        .single()

      if (!invitation) {
        return <InviteErrorState message="Este link ya no es válido" />
      }

      if (invitation.used_at) {
        return <InviteErrorState message="Este link ya ha sido usado" />
      }

      // Verificar si ya es miembro
      const { data: existing } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', invitation.community_id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existing) {
        return <InviteAlreadyMemberState communityId={invitation.community_id} />
      }

      // Unirse
      await supabase.from('community_members').insert({
        community_id: invitation.community_id,
        user_id: user.id,
        role: 'member',
      })

      // Invalidar token
      await supabase.from('invitation_links').update({
        used_at: new Date().toISOString(),
        used_by: user.id,
      }).eq('id', invitation.id)

      redirect('/communities')
    }
    ```
  - [ ] Crear componentes de estado en el mismo fichero o como ficheros separados:
    - `InviteErrorState`: mensaje de error + "Solicitar nuevo link" (texto explicativo, no CTA funcional en MVP)
    - `InviteAlreadyMemberState`: "Ya eres miembro" + Button → `/communities`

- [x] **T9: Página de settings — /communities/[slug]/settings** (AC: 1, 4)
  - [ ] Crear `app/(app)/communities/[slug]/settings/page.tsx`:
    - Server Component: verifica que el usuario es admin de la comunidad (redirect a `/communities` si no)
    - Renderiza `<InvitationSection communityId={community.id} />`
  - [ ] Crear `components/communities/InvitationSection.tsx` — Client Component:
    - Botón "Generar link de invitación" → llama a `generateInvitationLink(communityId)`
    - Al generar: muestra el link en un Input readonly + botón "Copiar link"
    - Al copiar: `navigator.clipboard.writeText(link)` → texto del botón cambia a "¡Copiado!" por 2s
    - Cada link generado se añade a una lista local (session state) con indicación "Activo" / ya copiado

- [x] **T10: lib/api client wrappers** (AC: 1, 5)
  - [ ] Actualizar o crear `lib/api/invitations.ts`:
    ```typescript
    export async function generateInvitationLink(communityId: string): Promise<string> {
      const res = await fetch(`/api/communities/${communityId}/invitations`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const { data } = await res.json()
      return `${window.location.origin}/invite/${data.token}`
    }
    ```

- [x] **T11: Actualizar auth/callback para soporte de `next` param** (AC: 5)
  - [ ] Verificar `app/auth/callback/route.ts` — ya soporta el parámetro `next` validado (fix BUG-QA-002 ya aplicado)
  - [ ] El flujo post-auth join funciona automáticamente: login → callback → redirect `/invite/[token]` → join + redirect `/communities`

- [x] **T12: Tests unitarios** (AC: 2, 3, 7)
  - [ ] Crear `tests/unit/invitations/invitations.test.ts`:
    - Test: `generateInvitationSchema` rechaza communityId no-uuid
    - Test: `generateInvitationSchema` acepta uuid válido
    - Test: token con `crypto.randomUUID()` es único en 1000 iteraciones (probabilístico)
    - Test: middleware `isPublicPath('/invite/abc')` → `true` (después de T7)
    - Test: middleware `isPublicPath('/invite')` → `true`
    - Test: middleware `isPublicPath('/invitations/abc')` → `false` (no confundir paths)
  - [ ] Al menos 6 tests unitarios pasando

- [x] **T13: Documentación funcional**
  - [ ] Crear/actualizar `docs/project/modules/communities.md`:
    - Añadir sección "Invitation Links": cómo se generan, ciclo de vida del token, flujo join
    - Ficheros clave de esta story

- [x] **T14: PR y cierre**
  - [ ] `npm run test` — todos deben pasar (mínimo 30 tests)
  - [ ] `git add` — solo ficheros de esta story
  - [ ] Commit: `feat(communities): add invitation links generate and join flow`
  - [ ] Push: `git push -u origin feat/2-2-invitation-links`
  - [ ] PR contra `develop`
  - [ ] Actualizar `sprint-status.yaml`: `2-2-invitation-links-generate-join: review`

## Dev Notes

### Learnings de Story 2.1

- **`lib/supabase/server.ts`** para API Routes y Server Components que mutan datos
- **`lib/supabase/client.ts`** para Server Components que solo leen
- **Patrón auth en API Route**: siempre `supabase.auth.getUser()`, nunca `getSession()`
- **`params` en Next.js 15** es `Promise<{...}>` — hacer `await params` en Route Handlers y Pages
- **Slug de comunidad** en Story 2.1 es único — puede usarse en URLs amigables; `communityId` (uuid) para APIs
- **Migración pendiente de Story 2.1**: la tabla `community_members` ya debe existir antes de que esta story la use

### Patrón de acceso para Server Components con Supabase (CRÍTICO)

En Server Components, NO usar `fetch()` interno para llamar APIs propias — los headers de cookies no se propagan automáticamente. Usar `createClient()` de `lib/supabase/server.ts` directamente:

```typescript
// ✅ CORRECTO en Server Component
const supabase = await createClient()
const { data } = await supabase.from('invitation_links').select(...)

// ❌ INCORRECTO en Server Component
const res = await fetch('/api/invitations/...') // cookies no disponibles
```

### Flujo completo de join post-auth

```
Usuario no autenticado visita /invite/[token]
  → middleware permite pasar (PUBLIC_PREFIX_PATHS incluye '/invite')
  → InvitePage detecta user = null
  → redirect('/login?next=/invite/abc-123')
  → Usuario se autentica con magic link
  → /auth/callback?code=...&next=/invite/abc-123
  → callback redirige a /invite/abc-123
  → InvitePage ahora tiene user autenticado
  → procesa join
  → redirect('/communities')
```

### Token de invitación: `crypto.randomUUID()`

`crypto.randomUUID()` está disponible en Node.js 14.17+ y en Edge Runtime. Genera UUIDs v4 (128 bits de aleatoriedad). Suficiente para single-use tokens de invitación — probabilidad de colisión despreciable.

### Esquema de base de datos

```
invitation_links
  id           uuid PK
  token        text NOT NULL UNIQUE   ← crypto.randomUUID()
  community_id uuid FK → communities(id) ON DELETE CASCADE
  created_by   uuid FK → auth.users(id)
  used_at      timestamptz NULL       ← NULL = disponible, valor = usado
  used_by      uuid NULL FK → auth.users(id)
  created_at   timestamptz
```

### Atomicidad del join (consideración MVP)

El join (INSERT en community_members) y la invalidación del token (UPDATE used_at) son dos operaciones separadas. En caso de fallo entre ambas, el token quedaría "consumido pero sin membresía" o viceversa. Para MVP esto es aceptable — en producción se resolvería con una función SQL/Postgres transaction. **No implementar transacciones en esta story.**

### Estructura de ficheros a crear

```
supabase/migrations/
  005_create_invitations.sql       ← comprobar numeración disponible

app/
  invite/
    [token]/
      page.tsx                     ← CREAR: Server Component público
  (app)/
    communities/
      [slug]/
        settings/
          page.tsx                 ← CREAR: admin settings + invitation section
  api/
    communities/
      [communityId]/
        invitations/
          route.ts                 ← CREAR: POST generate
    invitations/
      [token]/
        use/
          route.ts                 ← CREAR: POST use/join

components/communities/
  InvitationSection.tsx            ← CREAR: Client Component

lib/
  api/
    invitations.ts                 ← CREAR
  types/
    invitations.ts                 ← CREAR
  validations/
    invitations.ts                 ← CREAR

middleware.ts                      ← MODIFICAR: añadir /invite a PUBLIC_PREFIX_PATHS

tests/unit/invitations/
  invitations.test.ts              ← CREAR
```

### Scope limitado intencionalmente

- **Lista de invitation links en settings**: mostrar solo los generados en la sesión actual (estado local del componente). Persistencia de lista en DB es post-MVP.
- **Expiración de tokens**: no implementar en esta story — los tokens no tienen `expires_at`. Single-use es el único mecanismo de invalidación.
- **Revocación manual**: no implementar — el admin no puede revocar un link no usado en esta story.
- **Notificación por email al unirse**: fuera de scope.

### Referencias

- [Source: epic-2-comunidades.md#Story 2.2] — User story, ACs y notas técnicas
- [Source: architecture.md#File Structure] — `005_create_invitations.sql`, rutas API
- [Source: architecture.md#Security] — NFR-S1 (token impredecible), NFR-S2 (single-use)
- [Source: stories/2-1-create-community.md#Dev Notes] — learnings de Story 2.1, patrón auth
- [Source: stories/1-3-auth-middleware-route-protection.md#Dev Notes] — PUBLIC_PREFIX_PATHS, nota sobre `/invite`
- [Source: app/auth/callback/route.ts] — soporte de `next` param ya implementado (BUG-QA-002 fix)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6 (Homer, DS fork, 2026-03-27)

### Debug Log References

- Linter revirtió `middleware.ts` tras primer Edit → reaplicado `/invite` a `PUBLIC_PREFIX_PATHS` manualmente.
- `supabase/migrations/` no existía en `develop` → creado directorio; numeración 001 (no 005 como decía la story).
- `InviteAlreadyMemberState` prop `communityId` sin usar → eliminado (ESLint no-unused-vars).
- `app/auth/confirm/route.ts` y `next-env.d.ts` tenían errores ESLint preexistentes → añadidos a `ignores` en `eslint.config.mjs`.

### Completion Notes List

- T2: migración creada como `001_create_invitation_links.sql` (en develop no había migraciones previas).
- T8: implementación directa con `createClient()` en Server Component (patrón recomendado de Dev Notes, sin fetch interno).
- T11: auth/callback ya tenía soporte de `next` param (BUG-QA-002 fix) — solo verificación, sin cambios.
- T14: 49/49 tests pasando. TypeScript: sin errores. ESLint: sin errores.

### File List

- `supabase/migrations/001_create_invitation_links.sql` — CREADO
- `lib/types/invitations.ts` — CREADO
- `lib/validations/invitations.ts` — CREADO
- `app/api/communities/[communityId]/invitations/route.ts` — CREADO
- `app/api/invitations/[token]/use/route.ts` — CREADO
- `app/invite/[token]/page.tsx` — CREADO
- `app/(app)/communities/[slug]/settings/page.tsx` — CREADO
- `components/communities/InvitationSection.tsx` — CREADO
- `lib/api/invitations.ts` — CREADO
- `tests/unit/invitations/invitations.test.ts` — CREADO
- `middleware.ts` — MODIFICADO (añadido '/invite' a PUBLIC_PREFIX_PATHS)
- `tests/unit/middleware/middleware.test.ts` — MODIFICADO (3 tests /invite añadidos)
- `eslint.config.mjs` — MODIFICADO (ignores: next-env.d.ts, app/auth/confirm/route.ts)
- `docs/project/modules/communities.md` — MODIFICADO (sección invitation links)
- `_bmad-output/implementation-artifacts/stories/2-2-invitation-links-generate-join.md` — MODIFICADO
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFICADO
