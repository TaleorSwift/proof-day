# Invitaciones

## Qué hace
Permite a los admins de una comunidad generar links de invitación de un solo uso.
Cuando un usuario visita `/invite/[token]`, el sistema valida el token, comprueba
si ya es miembro y, si todo es correcto, lo incorpora a la comunidad con rol `member`
y redirige a `/communities`. La ruta requiere sesión activa — si el usuario no está autenticado se redirige a `/login?next=/invite/[token]`.

## Reglas de comportamiento
- Solo admins pueden generar invitation links desde `/communities/[slug]/settings` (story 2.2)
- Cada link es de un solo uso — se invalida marcando `used_at` al join exitoso (story 2.2)
- Si el usuario no está autenticado al visitar `/invite/[token]`, se redirige a `/login?next=/invite/[token]` (story 2.2)
- Si el token no existe o ya fue usado, se muestra "Link inválido" sin revelar si existió (story 2.2)
- Si el usuario ya es miembro, se muestra "Ya eres miembro" con link a `/communities` — sin error (story 2.2)
- Si la invalidación del token falla tras el join, se hace rollback de la membresía y se muestra error (story 2.2)
- El token solo aparece en parámetros SQL — nunca en URLs ni logs (story 2.2)

## Ficheros clave
- `app/invite/[token]/page.tsx`
- `components/invitations/InviteErrorState.tsx`
- `components/invitations/InviteAlreadyMemberState.tsx`
- `app/api/communities/[communityId]/invitations/route.ts`
- `supabase/migrations/001_create_invitation_links.sql`

## Última actualización
Story 2.2 — 2026-04-28
