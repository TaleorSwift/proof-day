# Communities

## Qué hace
Permite a usuarios autenticados crear y listar comunidades privadas. Cada comunidad tiene nombre, descripción e imagen opcional. El creador queda registrado automáticamente como admin. Las comunidades están aisladas por RLS: cada usuario solo ve las suyas.

## Reglas de comportamiento
- La ruta `/communities/new` muestra un formulario con campos nombre (obligatorio, 3-60 chars), descripción (obligatorio) e imagen como URL externa opcional. (story 2.1)
- Al crear una comunidad, el creador queda registrado como admin en `community_members` en la misma transacción. (story 2.1)
- El nombre de comunidad debe ser único: el backend genera un slug y valida unicidad antes de insertar. Devuelve 409 si ya existe o si hay race condition (código PostgreSQL 23505). El error 409 se muestra como error inline bajo el campo `name` en el formulario. (story 2.1, mejorado en CR2)
- Los nombres que solo contienen caracteres especiales son rechazados con 400 (slug vacío no válido). (story 2.1)
- Si el usuario no pertenece a ninguna comunidad, `/communities` muestra un empty state con CTA "Crear comunidad" y un botón "Usar link de invitación". (story 2.1)
- La validación de errores es inline bajo cada campo, no en toast ni alert. (story 2.1)
- Toda mutación va por API Route (`POST /api/communities`), nunca por Server Actions. (story 2.1)
- `GET /api/communities` aplica filtro explícito por membresía del usuario (segunda línea de defensa además del RLS). (story 2.1, CR2-F2)
- Los admins pueden actualizar roles y eliminar miembros de su comunidad (políticas RLS UPDATE y DELETE en `community_members`). La UI se implementa en stories futuras. (story 2.1, CR2-F1)

## Ficheros clave
- `app/api/communities/route.ts` — GET y POST, auth check, validación Zod, slug generation
- `components/communities/CommunityForm.tsx` — Client Component con react-hook-form + Zod
- `supabase/migrations/003_rls_policies.sql` — RLS para communities y community_members
- `supabase/migrations/004_rls_community_members_admin_policies.sql` — RLS UPDATE/DELETE para admins

## Última actualización
Story 2.1 CR2-Fixes — 2026-03-28
