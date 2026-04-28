# Communities

## Qué hace
Permite a usuarios autenticados crear, listar y acceder a comunidades privadas. Cada comunidad tiene nombre, descripción, imagen opcional y conteo de miembros. El creador queda como admin. Las comunidades están completamente aisladas: cada usuario solo ve las suyas (RLS + filtro explícito en API). El acceso directo sin membresía redirige con mensaje contextual.

## Reglas de comportamiento
- La ruta `/communities/new` muestra formulario con campos nombre (3-60 chars), descripción (obligatorio) e imagen URL opcional. (story 2.1)
- Al crear una comunidad, el creador queda registrado como admin en `community_members`. (story 2.1)
- El nombre de comunidad debe ser único: el backend genera un slug y valida unicidad. 409 si ya existe (error inline bajo el campo `name`). Nombres con solo caracteres especiales rechazados con 400. (story 2.1, CR2)
- `GET /api/communities` aplica filtro explícito por membresía del usuario (segunda línea de defensa además del RLS). Devuelve `{ data: Community[], count: number }` con `memberCount` por comunidad. (story 2.1 CR2-F2, story 2.3 AC-7)
- `/communities` lista SOLO las comunidades del usuario autenticado. Si tiene exactamente 1 comunidad, redirige automáticamente a `/communities/[slug]`. (story 2.3 AC-1, AC-5)
- Acceso por URL directa a una comunidad sin membresía → redirect a `/communities?error=no-access` con banner de error. La existencia de la comunidad es opaca para no-miembros. (story 2.3 AC-2, AC-3)
- Card de comunidad muestra: nombre, descripción (máx 2 líneas), imagen con fallback a avatar con inicial, número de miembros. (story 2.3 AC-4)
- Navbar muestra selector de comunidad activa (`CommunitySwitcher`) cuando el usuario pertenece a 2 o más comunidades. Con 1 comunidad, muestra el nombre como texto. (story 2.3 AC-6)
- `/communities/[slug]` muestra layout base de la comunidad (imagen, nombre, descripción, miembros). Botón "Configuración" visible solo para admins. (story 2.3 AC-8)
- `/communities` muestra botón "+ Nueva comunidad" junto al título cuando el usuario ya tiene 2 o más comunidades. (bug fix 2026-04-14)
- `/communities/[slug]` incluye enlace "← Mis comunidades" para volver al listado. (bug fix 2026-04-14)
- Todas las comunidades de prueba (fixtures) tienen imagen asignada. (bug fix 2026-04-14)
- El feed de comunidad muestra el conteo real de feedbacks por proyecto (batch-fetch por community_id, sin N+1). (bug fix 2026-04-14)
- Los admins pueden actualizar roles y eliminar miembros (políticas RLS UPDATE y DELETE en `community_members`). La UI se implementa en stories futuras. (story 2.1, CR2-F1)
- Toda mutación va por API Route, nunca por Server Actions. (story 2.1)

## Reglas de comportamiento (a11y — Fase 5)
- El layout incluye un skip navigation link visible on focus que salta a `#main-content` (WCAG 2.4.1). (Fase 5)
- Cualquier error en rutas `/communities/*` muestra `error.tsx` con botón "Reintentar". (Fase 5)
- Durante carga, se muestra `loading.tsx` con spinner accesible (`role="status"`, `aria-busy`). (Fase 5)

## Tests

### Unit
- `tests/unit/communities/CommunitiesPage.test.tsx` — redirect AC-1/AC-5, empty state, lista, botón nueva comunidad, rama no-auth, banner no-access
- `tests/unit/communities/CommunityForm.test.tsx` — render accesible, validación zod, submit válido (con/sin onSuccess), COMMUNITY_NAME_TAKEN inline, ApiError genérico, Error genérico, estado submitting
- `tests/unit/communities/CommunitiesNewPage.test.tsx` — smoke: heading "Crear comunidad", mock CommunityForm presente
- `tests/unit/communities/CommunityList.test.tsx` — render N tarjetas, hrefs correctos, lista vacía
- `tests/unit/communities/CommunitySwitcher.test.tsx` — 0/1/N comunidades, navegación al slug
- `tests/unit/communities/loadingState.test.tsx` — role="status", aria-busy, aria-label
- `tests/unit/communities/errorState.test.tsx` — título, mensaje, botón Reintentar, callback reset

### E2E
- `tests/e2e/communities/create-community.spec.ts` — creación de comunidad (flujo completo), nombre duplicado (COMMUNITY_NAME_TAKEN inline), imageUrl válida, imageUrl inválida, name >60 chars, description >500 chars; error 500 → test.todo
- `tests/e2e/communities/community-list.spec.ts` — banner no-access, switcher (skip: requiere seed ≥2 comunidades), empty state (skip: requiere usuario sin comunidades)

## Storybook
- `stories/communities/CommunityCard.stories.tsx` — Default, SinImagen, SinDescripcion, SingleMember, MultipleMembers
- `stories/communities/CommunityList.stories.tsx` — TwoCards, ManyCards
- `stories/communities/EmptyCommunitiesState.stories.tsx` — Default
- `stories/communities/CommunitySwitcher.stories.tsx` — OneCommunity, ManyCommunities, SinActiva
- `stories/communities/CommunitiesPage.stories.tsx` — Empty, ConLista, ConBannerNoAccess (wrappers visuales — página async no mockeable en SB)
- `stories/communities/CommunityForm.stories.tsx` — Default, ErrorNombreTomado (docs), ErrorServidor (docs)
- `stories/communities/CommunitiesNewPage.stories.tsx` — Default (fullscreen, wrapper inline de la página)

## Última actualización
Story 2.3 — 2026-03-28 | A11y Fase 5 — 2026-03-28 | Bug fixes UI — 2026-04-14 | Cobertura tests+stories — 2026-04-28 | Cobertura /communities/new — 2026-04-28
