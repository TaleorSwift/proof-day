# Story 6.1: User Profile (View & Edit)

Status: ready-for-dev

## Story

Como usuario,
quiero tener un perfil con mi bio e intereses, y poder ver el perfil de mis compañeros de comunidad,
para que el contexto de quién da feedback sea visible y el expertise sea reconocible.

## Acceptance Criteria

**Perfil propio:**
1. Ruta `/profile` — perfil propio del usuario autenticado
2. Campos editables: nombre/alias, bio (texto libre), intereses (tags)
3. Formulario de edición inline (no página separada)
4. Métricas visibles: número de feedbacks dados, número de proyectos creados (FR25)
5. Tabs: "Proyectos creados" | "Feedbacks dados"

**Perfil de otros:**
6. Ruta `/profile/[id]` — perfil de otro usuario
7. Solo accesible si el usuario autenticado comparte al menos una comunidad con el perfil (FR26, FR27)
8. Acceso a perfil sin comunidad compartida → 403 redirect
9. Campos visibles: nombre, bio, intereses, métricas (feedbacks dados, proyectos creados)
10. Tab "Proyectos creados" visible; feedbacks dados NO visibles para terceros

## Rejection Criteria

- NO mostrar perfil de usuarios sin comunidad compartida — error 403
- NO usar página separada para edición — inline
- NO exponer feedbacks dados de un usuario a terceros

## Tasks / Subtasks

- [ ] **T1: Feature branch**
  - [ ] `git checkout develop && git pull`
  - [ ] `git checkout -b feat/6-1-user-profile-view-edit`

- [ ] **T2: Migración SQL — tabla `profiles`**
  - [ ] Comprobar numeración en `supabase/migrations/`
  - [ ] Crear `supabase/migrations/00X_create_profiles.sql`:
    ```sql
    CREATE TABLE profiles (
      id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      name        text,
      bio         text,
      interests   text[] DEFAULT '{}',
      avatar_url  text,
      created_at  timestamptz NOT NULL DEFAULT now(),
      updated_at  timestamptz NOT NULL DEFAULT now()
    );

    -- Trigger para crear perfil vacío al registrar usuario
    CREATE OR REPLACE FUNCTION create_profile_for_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id) VALUES (NEW.id);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION create_profile_for_new_user();

    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

    -- Usuarios de la misma comunidad pueden verse entre sí
    CREATE POLICY "community_members_read_profiles"
      ON profiles FOR SELECT
      USING (
        auth.uid() = id
        OR auth.uid() IN (
          SELECT cm1.user_id
          FROM community_members cm1
          JOIN community_members cm2 ON cm1.community_id = cm2.community_id
          WHERE cm2.user_id = profiles.id
        )
      );

    -- Cada usuario edita solo su propio perfil
    CREATE POLICY "user_update_own_profile"
      ON profiles FOR UPDATE
      USING (auth.uid() = id);
    ```

- [ ] **T3: Schema Zod**
  - [ ] Crear `lib/validations/profiles.ts`:
    ```typescript
    import { z } from 'zod'

    export const updateProfileSchema = z.object({
      name: z.string().max(60, 'Nombre demasiado largo').optional(),
      bio: z.string().max(500, 'Bio demasiado larga').optional(),
      interests: z.array(z.string().max(30)).max(10, 'Máximo 10 intereses').optional(),
    })

    export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
    ```

- [ ] **T4: Tipos TypeScript**
  - [ ] Crear `lib/types/profiles.ts`:
    ```typescript
    export interface Profile {
      id: string
      name: string | null
      bio: string | null
      interests: string[]
      avatarUrl: string | null
      createdAt: string
      updatedAt: string
    }

    export interface ProfileWithStats extends Profile {
      feedbackCount: number
      projectCount: number
    }
    ```

- [ ] **T5: API Routes para perfiles** (AC: 7, 8)
  - [ ] Crear `app/api/profiles/[id]/route.ts`:
    ```typescript
    // GET — leer perfil (con verificación de comunidad compartida)
    export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
      // auth check
      // Si id === user.id: devolver perfil propio (siempre accesible)
      // Si id !== user.id: verificar que comparten comunidad (query community_members)
      //   → Si no comparten: 403
      // Obtener profile + count feedbacks + count projects
    }

    // PATCH — actualizar perfil propio
    export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
      // auth check
      // Verificar que params.id === user.id (solo propio)
      // Validar con updateProfileSchema
      // Update en profiles
    }
    ```

- [ ] **T6: Typed client wrappers**
  - [ ] Crear `lib/api/profiles.ts`:
    ```typescript
    export async function getProfile(id: string): Promise<ProfileWithStats> { ... }
    export async function updateProfile(id: string, data: UpdateProfileInput): Promise<Profile> { ... }
    ```

- [ ] **T7: Componente ProfileForm — edición inline** (AC: 2, 3)
  - [ ] Crear `components/profiles/ProfileForm.tsx` — Client Component:
    - `react-hook-form` + `zodResolver(updateProfileSchema)`
    - Campo `name` (Input), `bio` (Textarea), `interests` (tags editables: añadir/eliminar chips)
    - Botón "Guardar" + "Cancelar"
    - onSubmit: `updateProfile()` + toast de confirmación

- [ ] **T8: Página /profile — perfil propio** (AC: 1, 4, 5)
  - [ ] Crear `app/(app)/profile/page.tsx` — Server Component:
    - Carga `getProfile(user.id)` directamente con `lib/supabase/client.ts`
    - Renderiza `ProfileForm` con datos actuales
    - Métricas: "X feedbacks dados" + "Y proyectos creados"
    - `Tabs`: "Proyectos creados" (lista de proyectos del usuario) | "Feedbacks dados" (lista de feedbacks)

- [ ] **T9: Página /profile/[id] — perfil de otro usuario** (AC: 6, 7, 8, 9, 10)
  - [ ] Crear `app/(app)/profile/[id]/page.tsx` — Server Component:
    - Verifica comunidad compartida (o delega al API Route que devuelve 403)
    - Si 403: `redirect('/communities')` con mensaje
    - Muestra nombre, bio, intereses, métricas (sin feedbacks dados)
    - Solo tab "Proyectos creados"

- [ ] **T10: Tests unitarios** (AC: 7, 8)
  - [ ] Crear `tests/unit/profiles/profileValidation.test.ts`:
    - `updateProfileSchema` rechaza `name` > 60 chars
    - `updateProfileSchema` rechaza > 10 intereses
    - `updateProfileSchema` acepta campos vacíos (todos opcionales)
    - Al menos 3 tests

- [ ] **T11: Documentación funcional**
  - [ ] Crear `docs/project/modules/profiles.md`

- [ ] **T12: PR y cierre**
  - [ ] `npm run test` — todos deben pasar
  - [ ] Commit: `feat(profiles): add user profile view and edit`
  - [ ] Push + PR contra `develop`
  - [ ] Actualizar `sprint-status.yaml`: `6-1-user-profile-view-edit: review`

## Dev Notes

### Trigger de creación automática de perfil

El trigger `on_auth_user_created` crea un perfil vacío (solo `id`) en cuanto un usuario se registra via Supabase Auth. Esto garantiza que siempre haya un registro en `profiles` para cada `auth.user`. Homer debe verificar que el trigger existe antes de implementar el resto.

### Dependencias

- **Prerrequisito:** Story 4-1 (tabla `feedbacks` para count)
- **Prerrequisito:** Story 3-1 (tabla `projects` para count)
- Story 4-2 hace un join con `profiles` — si el trigger ya está activo, el join funcionará

### References

- [Source: epic-6-perfiles-gamificacion.md#Story 6.1] — ACs y notas técnicas
- [Source: architecture.md#Structure Patterns] — `app/(app)/profile/`, `lib/api/profiles.ts`
- [Source: ux-design-specification.md#Screen Inventory] — rutas `/profile` y `/profile/[id]`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

N/A — 173/173 tests pasan. Sin errores.

### Completion Notes List

- Migración `009_create_profiles.sql` con trigger auto-creación y RLS policies
- API Route `app/api/profiles/[id]/route.ts`: GET (verificación comunidad compartida) + PATCH (solo propio)
- Server Component page.tsx para /profile (carga directa con Supabase server client)
- Server Component page.tsx para /profile/[id] (403 → redirect a /communities si no comparten comunidad)
- Client Component OwnProfileView: edición inline sin página separada (AC3)
- Client Component ProfileForm: react-hook-form + zodResolver, tags editables
- 9 tests unitarios de validación Zod (173 total, todos pasan)

### File List

- `supabase/migrations/009_create_profiles.sql` (CREATED)
- `lib/validations/profiles.ts` (CREATED)
- `lib/types/profiles.ts` (CREATED)
- `app/api/profiles/[id]/route.ts` (CREATED)
- `lib/api/profiles.ts` (MODIFIED — implementación completa)
- `components/profiles/ProfileForm.tsx` (CREATED)
- `components/profiles/OwnProfileView.tsx` (CREATED)
- `app/(app)/profile/page.tsx` (CREATED)
- `app/(app)/profile/[id]/page.tsx` (CREATED)
- `tests/unit/profiles/profileValidation.test.ts` (CREATED — 9 tests)
