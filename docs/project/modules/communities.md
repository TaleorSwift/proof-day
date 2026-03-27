# Communities

## Qué hace
Permite a usuarios autenticados crear y listar comunidades privadas. Cada comunidad tiene nombre, descripción e imagen opcional. El creador queda registrado automáticamente como admin. Las comunidades están aisladas por RLS: cada usuario solo ve las suyas.

## Reglas de comportamiento
- La ruta `/communities/new` muestra un formulario con campos nombre (obligatorio, 3-60 chars), descripción (obligatorio) e imagen como URL externa opcional. (story 2.1)
- Al crear una comunidad, el creador queda registrado como admin en `community_members` en la misma transacción. (story 2.1)
- El nombre de comunidad debe ser único: el backend genera un slug y valida unicidad antes de insertar. Devuelve 409 si ya existe o si hay race condition (código PostgreSQL 23505). (story 2.1)
- Los nombres que solo contienen caracteres especiales son rechazados con 400 (slug vacío no válido). (story 2.1)
- Si el usuario no pertenece a ninguna comunidad, `/communities` muestra un empty state con CTA "Crear comunidad" y un botón "Usar link de invitación" (deshabilitado hasta Story 2.2). (story 2.1)
- La validación de errores es inline bajo cada campo, no en toast ni alert. (story 2.1)
- Toda mutación va por API Route (`POST /api/communities`), nunca por Server Actions. (story 2.1)
- El acceso a Supabase en API Routes usa `createClient()` de `lib/supabase/server.ts` y `getUser()`, nunca `getSession()`. (story 2.1)

## Ficheros clave
- `app/api/communities/route.ts` — GET y POST, auth check, validación Zod, slug generation
- `components/communities/CommunityForm.tsx` — Client Component con react-hook-form + Zod
- `app/(app)/communities/page.tsx` — lista o empty state (Server Component)
- `lib/validations/communities.ts` — schema Zod
- `lib/types/communities.ts` — tipos Community y CommunityMember

## Última actualización
Story 2.1 CR-Fixes — 2026-03-27
