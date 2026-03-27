# Communities

## Qué hace
Permite a usuarios autenticados crear y listar comunidades privadas. El admin puede invitar miembros mediante links de un solo uso. Las comunidades están aisladas por RLS: cada usuario solo ve las suyas.

## Reglas de comportamiento
- La ruta `/communities/new` muestra un formulario con campos nombre (obligatorio, 3-60 chars), descripción (obligatorio) e imagen como URL externa opcional. (story 2.1)
- Al crear una comunidad, el creador queda registrado como admin en `community_members` en la misma transacción. (story 2.1)
- El nombre de comunidad debe ser único: el backend genera un slug y valida unicidad antes de insertar. Devuelve 409 si ya existe o si hay race condition (código PostgreSQL 23505). (story 2.1)
- Los nombres que solo contienen caracteres especiales son rechazados con 400 (slug vacío no válido). (story 2.1)
- Si el usuario no pertenece a ninguna comunidad, `/communities` muestra un empty state con CTA "Crear comunidad" y un botón "Usar link de invitación". (story 2.1, habilitado en story 2.2)
- La validación de errores es inline bajo cada campo, no en toast ni alert. (story 2.1)
- Toda mutación va por API Route, nunca por Server Actions ni directamente desde Server Components. (story 2.1, reforzado story 2.2)
- El admin puede generar invitation links desde `/communities/[slug]/settings` — cada link es de un solo uso (single-use enforced via `used_at`). (story 2.2)
- El token de invitación se genera con `crypto.randomUUID()` — impredecible (NFR-S1). (story 2.2)
- Usuario no autenticado que visita `/invite/[token]` es redirigido a `/login?next=/invite/[token]` y vuelve tras autenticarse. (story 2.2)
- Usuario ya miembro de la comunidad que usa un link: recibe mensaje "Ya eres miembro" con link a `/communities` — no error. (story 2.2)
- Token ya usado o inexistente: muestra "Este link ya no es válido". (story 2.2)
- La validación del token usa una función RPC SECURITY DEFINER para no exponer la tabla completa a usuarios autenticados. (story 2.2)
- El token NO aparece en logs de URL: `/invite/[token]/page.tsx` usa `createClient()` + RPC directamente, sin fetch interno. (story 2.2, CR4-F1 fix)
- La API Route `/api/invitations/[token]/use` aplica auth check antes de validación Zod — REST semántico correcto. (story 2.2, CR4-F4 fix)

## Ficheros clave
- `app/api/communities/[communityId]/invitations/route.ts` — POST generar invitation link
- `app/api/invitations/[token]/use/route.ts` — POST usar/validar token (client-side use)
- `components/communities/InvitationSection.tsx` — Client Component: generar y copiar links
- `app/invite/[token]/page.tsx` — Server Component público: procesa join directamente via Supabase
- `supabase/migrations/001_create_invitation_links.sql` — tabla + RLS + RPC SECURITY DEFINER

## Última actualización
Story 2.2 — 2026-03-28 (CR#4 fixes)
