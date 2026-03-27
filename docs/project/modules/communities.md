# Communities

## Qué hace
Permite a usuarios autenticados crear y listar comunidades privadas. Cada comunidad tiene nombre, descripción e imagen opcional. El creador queda registrado automáticamente como admin. Las comunidades están aisladas por RLS: cada usuario solo ve las suyas.

## Reglas de comportamiento
- La ruta `/communities/new` muestra un formulario con campos nombre (obligatorio, 3-60 chars), descripción (obligatorio) e imagen como URL externa opcional. (story 2.1)
- Al crear una comunidad, el creador queda registrado como admin en `community_members` en la misma transacción. (story 2.1)
- El nombre de comunidad debe ser único: el backend genera un slug y valida unicidad antes de insertar. Devuelve 409 si ya existe. (story 2.1)
- Si el usuario no pertenece a ninguna comunidad, `/communities` muestra un empty state con CTAs "Crear comunidad" y aviso para usar link de invitación. (story 2.1)
- La validación de errores es inline bajo cada campo, no en toast ni alert. (story 2.1)
- Toda mutación va por API Route, nunca por Server Actions. (story 2.1)
- El acceso a Supabase en API Routes usa `createClient()` de `lib/supabase/server.ts` y `getUser()`, nunca `getSession()`. (story 2.1)
- Los admins pueden generar invitation links de un solo uso desde `/communities/[slug]/settings`. Cada link se invalida tras su primer uso (campo `used_at`). (story 2.2)
- El token de invitación se genera con `crypto.randomUUID()` — es criptográficamente aleatorio. (story 2.2)
- La ruta `/invite/[token]` es pública: si el usuario no está autenticado, redirige a `/login?next=/invite/[token]` y completa el join tras el login. (story 2.2)
- Si el usuario ya es miembro de la comunidad al visitar el link, se muestra un mensaje informativo (no error). (story 2.2)
- Si el token es inválido o ya fue usado, se muestra un mensaje de error con instrucciones para solicitar uno nuevo. (story 2.2)

## Ficheros clave
- `app/api/communities/route.ts` — GET y POST (crear comunidad)
- `app/api/communities/[communityId]/invitations/route.ts` — POST generate invitation
- `app/api/invitations/[token]/use/route.ts` — POST usar/join con token
- `app/(app)/communities/[slug]/settings/page.tsx` — settings page del admin
- `components/communities/InvitationSection.tsx` — Client Component para gestionar invitaciones

## Última actualización
Story 2.2 — 2026-03-27
