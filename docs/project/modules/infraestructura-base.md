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

## Ficheros clave
- `lib/supabase/client.ts` — client para Client Components
- `lib/supabase/server.ts` — client para Server Components y API Routes
- `middleware.ts` — auth gate (placeholder hasta story 1.3)
- `app/globals.css` — design tokens CSS custom properties
- `tailwind.config.ts` — extensiones Tailwind con tokens de Proof Day

## Ultima actualizacion
Story 1.1 — 2026-03-27
