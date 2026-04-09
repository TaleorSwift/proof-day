# Infraestructura Base

## Que hace
Provee la base tecnica sobre la que se construyen todos los modulos de Proof Day.
Incluye el proyecto Next.js 15, la conexion con Supabase, el sistema de design tokens,
los componentes UI base y las herramientas de desarrollo (tests, linting, Storybook).
Sin esta infraestructura ningun modulo funcional puede implementarse.

## Reglas de comportamiento
- El acceso a Supabase desde componentes se hace SIEMPRE a traves de `lib/supabase/` — nunca importando `@supabase/supabase-js` o `@supabase/ssr` directamente (story 1.1)
- Para leer la sesion del usuario se usa `getClaims()` o `getUser()`. El metodo `getSession()` esta bloqueado por ESLint (story 1.1)
- Los colores, espaciados, tipografia y radios se definen en `docs/project/design-tokens.md` y se acceden via CSS variables — sin valores hardcodeados (story 1.1)
- Los componentes de `components/ui/` (shadcn/ui) son intocables — se usan sin modificar, se extienden con wrappers si es necesario (story 1.1)
- Los commits siguen Conventional Commits — mensajes que no cumplan son rechazados automaticamente por Husky (story 1.1)
- El desarrollo va en ramas `feat/{story-key}-descripcion` desde `develop` — nunca directo a `main` (story 1.1)

## Reglas de comportamiento (arquitectura — Arch Fase 3)
- Todos los API routes usan `requireAuth()` de `lib/api/middleware/require-auth.ts` — nunca duplican el pattern auth inline (Arch Fase 3)
- Las queries a Supabase van por repositories en `lib/repositories/` — los route handlers no tocan Supabase directamente (Arch Fase 3)
- La lógica de negocio va en services en `lib/services/` — los route handlers son thin controllers (~50 líneas) (Arch Fase 3)
- Utilidades de UI (`getRelativeTime`, `getInitials`) van en `lib/utils/` — nunca inline en componentes (Arch Fase 3)

## Entornos de desarrollo

Único comando: `npm run dev`. El entorno lo determina `.env.local`:

| Entorno | `NEXT_PUBLIC_SUPABASE_URL` |
|---------|---------------------------|
| Supabase local (Docker) | `http://127.0.0.1:54321` |
| Supabase remoto | `https://xxx.supabase.co` |

No existe mock mode ni scripts `dev:*` adicionales. Ver `docs/project/modules/local-development.md` para setup completo.

## Ficheros clave
- `lib/supabase/client.ts` — client para Client Components
- `lib/supabase/server.ts` — client para Server Components y API Routes
- `lib/supabase/middleware.ts` — session refresh para middleware de Next.js
- `lib/api/middleware/require-auth.ts` — auth middleware compartido para API routes
- `lib/repositories/` — capa de acceso a datos (5 repositorios)
- `lib/services/` — capa de lógica de negocio (3 servicios)
- `lib/utils/date.ts`, `lib/utils/string.ts` — utilidades compartidas
- `middleware.ts` — auth gate Next.js
- `app/globals.css` — design tokens CSS custom properties
- `supabase/config.toml` — configuración Supabase CLI para entorno local
- `supabase/seed.sql` — datos de muestra para entorno local
- `supabase/migrations/` — 10 migraciones SQL (schema completo)

## Ultima actualizacion
Story 1.1 — 2026-03-27 | Arch Fase 3 — 2026-03-28 | Infra local + eliminación mock — 2026-04-07
