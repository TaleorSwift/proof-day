# Epic 2: Comunidades

**Estado:** backlog
**Objetivo:** Crear espacios privados con acceso controlado por invitación donde los Builders y Reviewers comparten proyectos.
**FRs cubiertos:** FR5, FR6, FR7, FR8
**Valor entregado:** Un Admin puede crear una comunidad, invitar miembros y todos los miembros solo ven su comunidad.

---

## Story 2.1: Create Community

**Como** usuario autenticado,
**quiero** poder crear una comunidad privada con nombre, descripción e imagen,
**para que** mi equipo tenga un espacio privado de validación de ideas.

### Criterios de Aceptación

- [ ] Pantalla `/communities/new` con campos: nombre (obligatorio), descripción (obligatorio), imagen (opcional)
- [ ] Al crear comunidad: el usuario queda como Admin automáticamente
- [ ] Comunidad creada aparece en la lista `/communities` del creador
- [ ] Nombre único dentro de la plataforma (validación backend)
- [ ] Si el usuario no pertenece a ninguna comunidad: empty state en `/communities` con CTA "Crear comunidad" o "Usar link de invitación"
- [ ] Imagen de comunidad: upload a Supabase Storage o URL externa
- [ ] Validación inline en formulario (no toast): campos vacíos, nombre muy corto

### Notas Técnicas

- `app/communities/new/page.tsx` — formulario de creación
- `app/api/communities/route.ts` — POST handler
- `lib/api/communities.ts` — typed client wrapper
- Tabla `communities` + `community_members` (rol admin)
- RLS: solo miembros pueden leer su comunidad

---

## Story 2.2: Invitation Links (Generate & Join)

**Como** Admin de una comunidad,
**quiero** poder generar links de invitación de un solo uso,
**para que** pueda incorporar miembros a mi comunidad sin gestión manual.

### Criterios de Aceptación

- [ ] Admin puede generar múltiples invitation links desde `/communities/[slug]/settings`
- [ ] Cada link es de un solo uso — se invalida tras uso exitoso (NFR-S2)
- [ ] Link generado criptográficamente no predecible (NFR-S1)
- [ ] Link copiado al clipboard con un clic
- [ ] Ruta pública `/invite/[token]` — si autenticado: join directo + redirect a comunidad; si no: redirect a login + join post-auth
- [ ] Usuario ya miembro de la comunidad ve mensaje "Ya eres miembro" (no error)
- [ ] Link expirado o usado: mensaje de error claro

### Notas Técnicas

- `app/invite/[token]/page.tsx` — Server Component, procesa join
- `app/api/invitations/route.ts` — POST para generar, GET para validar
- `lib/api/communities.ts` — `generateInvitationLink()`, `joinCommunity()`
- Tabla `invitation_links` con columnas: token, community_id, used_at, created_by

---

## Story 2.3: Community Access Control & Listing

**Como** miembro de una o más comunidades,
**quiero** ver solo las comunidades de las que soy miembro,
**para que** el contenido de otras comunidades sea completamente inaccesible.

### Criterios de Aceptación

- [ ] `/communities` lista SOLO las comunidades del usuario autenticado (FR8)
- [ ] Acceso por URL directa a comunidad sin membresía → 403 o redirect
- [ ] RLS en Supabase: `community_members` filtra todos los queries de comunidad
- [ ] Card de comunidad: nombre + descripción + imagen + número de miembros
- [ ] Si el usuario pertenece a una sola comunidad: redirect automático a esa comunidad al login
- [ ] Navbar muestra selector de comunidad activa

### Notas Técnicas

- RLS policy: `SELECT` en `communities` solo si `auth.uid()` en `community_members`
- `supabase/migrations/006_rls_policies.sql` — políticas de comunidad
- `app/communities/page.tsx` — lista con Server Component
- `app/communities/[slug]/page.tsx` — vista de comunidad (layout base)
