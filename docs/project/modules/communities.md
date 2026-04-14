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
- Los admins pueden actualizar roles y eliminar miembros (políticas RLS UPDATE y DELETE en `community_members`). La UI se implementa en stories futuras. (story 2.1, CR2-F1)
- Toda mutación va por API Route, nunca por Server Actions. (story 2.1)

## Reglas de comportamiento (a11y — Fase 5)
- El layout incluye un skip navigation link visible on focus que salta a `#main-content` (WCAG 2.4.1). (Fase 5)
- Cualquier error en rutas `/communities/*` muestra `error.tsx` con botón "Reintentar". (Fase 5)
- Durante carga, se muestra `loading.tsx` con spinner accesible (`role="status"`, `aria-busy`). (Fase 5)

## Ficheros clave
- `app/api/communities/route.ts` — thin controller (~50 líneas): GET + POST
- `lib/repositories/communities.repository.ts` — queries Supabase (DIP)
- `lib/services/communities.service.ts` — validateMembership, generateUniqueSlug
- `app/(app)/communities/layout.tsx` — navbar + skip nav + main-content wrapper
- `app/(app)/communities/error.tsx` — error boundary para todas las rutas de comunidades
- `app/(app)/communities/loading.tsx` — loading state accesible

## Última actualización
Story 2.3 — 2026-03-28 | Bug fixes UI — 2026-04-14
