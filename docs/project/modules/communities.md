# Communities

## Qué hace
Permite a usuarios autenticados crear, listar y acceder a comunidades privadas. Cada comunidad tiene nombre, descripción, imagen opcional y conteo de miembros. El creador queda como admin. Las comunidades están completamente aisladas: solo se ven las del usuario. Los admins gestionan links de invitación de un solo uso desde la pantalla de configuración.

## Reglas de comportamiento
- `/communities/new` — formulario con nombre (3-60 chars), descripción (obligatorio), imagen URL opcional. (story 2.1)
- Al crear una comunidad, el creador queda registrado como admin en `community_members`. (story 2.1)
- Nombre único: 409 si ya existe (error inline bajo `name`). Caracteres especiales solos → 400. (story 2.1, CR2)
- `GET /api/communities` aplica filtro explícito por membresía (RLS + segunda línea de defensa). (story 2.1, 2.3)
- `/communities` lista solo las comunidades del usuario. Con 1 comunidad, redirige automáticamente. (story 2.3 AC-1)
- Acceso sin membresía → redirect a `/communities?error=no-access` con banner. (story 2.3 AC-2)
- Navbar muestra `CommunitySwitcher` con ≥2 comunidades. Con 1, muestra el nombre como texto. (story 2.3 AC-6)
- `/communities/[slug]` — feed con grid 2 columnas: columna principal (CommunityFeedHeader + ProjectFeed) y sidebar (CommunityHeader + TopContributors). (story 2.3 AC-8, PR4)
- El sidebar muestra nombre de comunidad, descripción, conteo de miembros y enlace "Configuración" solo para admins. (PR4)
- No autenticado → redirect `/login`. Comunidad no encontrada → `notFound()`. Sin membresía → redirect `/communities?error=no-access`. (PR4)
- `/communities/[slug]/settings` — solo accesible para admins. No-admin y no-autenticado → redirect. (story 2.2, PR3)
- Los admins generan links de invitación de un solo uso desde settings. Cada link solo puede usarse una vez. (story 2.2, PR3)
- Click "Copiar link" copia la URL al portapapeles y muestra "¡Copiado!" durante 2 segundos. (story 2.2, PR3)
- Toda mutación va por API Route, nunca por Server Actions. (story 2.1)
- Cada comunidad tiene un `reciprocity_threshold` (entero, DEFAULT 3) que define cuántos feedbacks debe haber dado un builder antes de poder publicar un nuevo proyecto (gate de reciprocidad). (story 11.1)

## Ficheros clave
- `app/(app)/communities/[slug]/page.tsx`
- `app/(app)/communities/[slug]/settings/page.tsx`
- `components/communities/CommunityHeader.tsx`
- `components/communities/InvitationSection.tsx`
- `app/(app)/communities/page.tsx`

## Tests y Storybook
- Unit: `CommunitiesPage`, `CommunityForm`, `CommunitiesNewPage`, `CommunityList`, `CommunitySwitcher`, `loadingState`, `errorState`, `CommunitySettingsPage`, `InvitationSection`, `CommunityFeedPage`, `CommunityHeader`
- E2E: `create-community.spec.ts`, `community-list.spec.ts`, `community-settings.spec.ts`, `project-feed.spec.ts`, `top-contributors.spec.ts`, `community-feed-sidebar.spec.ts`
- Storybook: `CommunityCard`, `CommunityList`, `EmptyCommunitiesState`, `CommunitySwitcher`, `CommunitiesPage`, `CommunityForm`, `CommunitiesNewPage`, `InvitationSection`, `CommunityHeader`, `CommunityFeedPage`

## Última actualización
Story 11.1 — 2026-05-06
