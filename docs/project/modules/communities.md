# Communities

## Qué hace
Permite a usuarios autenticados crear, listar y acceder a comunidades privadas. Cada comunidad tiene nombre, descripción, imagen de portada opcional y conteo de miembros. El creador queda como admin. Las comunidades están completamente aisladas: solo se ven las del usuario. Los admins gestionan la imagen de portada y links de invitación desde la pantalla de configuración.

## Reglas de comportamiento
- `/communities/new` — formulario con nombre (3-60 chars), descripción (obligatorio), imagen de portada opcional (upload de archivo o URL externa). (story 2.1, QD-community-image)
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
- La imagen de portada se sube al bucket `community-images` de Supabase Storage. La BD nunca almacena URLs externas: si el usuario proporciona una URL, el servidor la descarga y la guarda en Storage antes de persistir. (QD-community-image)
- El campo de imagen acepta dos modos: "Subir archivo" (JPG/PNG/WebP, max 5MB, upload directo del cliente) y "Desde URL" (el servidor la descarga con validación SSRF). (QD-community-image)
- La descarga de URL externa bloquea: http, IPs privadas (10.x, 172.16-31.x, 192.168.x, 169.254.x, 127.x), URL > 5MB, Content-Type no imagen. (QD-community-image)
- Los admins pueden cambiar la imagen de portada desde `/communities/[slug]/settings`. (QD-community-image)
- Toda mutación va por API Route, nunca por Server Actions. (story 2.1)
- Cada comunidad tiene un `reciprocityThreshold` (entero, DEFAULT 3) que define cuántos feedbacks debe haber dado un builder antes de poder publicar un nuevo proyecto (gate de reciprocidad). (story 11.1)
- El tipo `Community` (dominio) usa camelCase; `CommunityRow` (BD) usa snake_case. `communityFromRow()` mapea entre ambos. (story 11.1 CR)

## Ficheros clave
- `app/(app)/communities/[slug]/page.tsx`
- `app/(app)/communities/[slug]/settings/page.tsx`
- `components/communities/CommunityImageInput.tsx`
- `lib/utils/fetchExternalImage.ts`
- `supabase/migrations/034_storage_community_images.sql`

## Tests y Storybook
- Unit: `CommunitiesPage`, `CommunityForm`, `CommunitiesNewPage`, `CommunityList`, `CommunitySwitcher`, `loadingState`, `errorState`, `CommunitySettingsPage`, `InvitationSection`, `CommunityFeedPage`, `CommunityHeader`
- E2E: `create-community.spec.ts`, `community-list.spec.ts`, `community-settings.spec.ts`, `project-feed.spec.ts`, `top-contributors.spec.ts`, `community-feed-sidebar.spec.ts`
- Storybook: `CommunityCard`, `CommunityList`, `EmptyCommunitiesState`, `CommunitySwitcher`, `CommunitiesPage`, `CommunityForm`, `CommunitiesNewPage`, `InvitationSection`, `CommunityHeader`, `CommunityFeedPage`

## Última actualización
QD community-image — 2026-05-13
