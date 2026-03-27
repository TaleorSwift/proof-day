# Epic 1: Infraestructura & Autenticación

**Estado:** backlog
**Objetivo:** Establecer la base técnica del proyecto y el acceso sin fricción mediante magic link.
**FRs cubiertos:** FR1, FR2, FR3, FR4
**Valor entregado:** Un usuario puede autenticarse con su email y acceder a la plataforma sin contraseña.

---

## Story 1.1: Project Setup & Base Infrastructure

**Como** equipo de desarrollo,
**quiero** tener el proyecto Next.js 15 configurado con Supabase, ESLint, Husky y las convenciones base,
**para que** todos los agentes puedan implementar stories sobre una base consistente y enforzada.

### Criterios de Aceptación

- [ ] Proyecto creado con `create-next-app` usando template `with-supabase`
- [ ] Variables de entorno configuradas: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] ESLint configurado con reglas `no-restricted-imports` para bloquear importación directa de Supabase en client components
- [ ] Husky + commitlint configurado para Conventional Commits
- [ ] Tailwind configurado con design tokens de `docs/project/design-tokens.md`
- [ ] shadcn/ui inicializado con componentes base: Button, Card, Badge, Input, Textarea, Avatar, Dialog, Progress, Skeleton, NavigationMenu, Tabs, ToggleGroup, Tooltip, Separator, Form, Label, DropdownMenu
- [ ] `lib/supabase/client.ts` — cliente para Server Components
- [ ] `lib/supabase/server.ts` — cliente para API Routes
- [ ] `lib/supabase/middleware.ts` — cliente para middleware
- [ ] `middleware.ts` en raíz — protección de rutas autenticadas
- [ ] CSS custom properties de design tokens aplicadas en `app/globals.css`
- [ ] Estructura de carpetas base: `app/`, `components/ui/`, `lib/`, `types/`, `supabase/migrations/`
- [ ] Vitest configurado para tests unitarios
- [ ] Playwright configurado para tests E2E
- [ ] Storybook configurado con directorio `/stories/`
- [ ] `README.md` con instrucciones de setup

### Notas Técnicas

- Starter template: `npx create-next-app -e with-supabase proof-day`
- No se necesita login en esta story — solo setup
- ESLint custom rule: bloquear `@supabase/supabase-js` y `@supabase/ssr` en archivos dentro de `components/` o `app/` que no sean Server Components

---

## Story 1.2: Magic Link Authentication

**Como** usuario,
**quiero** poder autenticarme con mi email recibiendo un magic link,
**para que** pueda acceder a la plataforma sin necesidad de contraseña.

### Criterios de Aceptación

- [ ] Pantalla `/login` con campo email + botón "Continuar"
- [ ] Al enviar email válido: Supabase Auth envía magic link via Resend (SMTP configurado)
- [ ] Success state visible: "Revisa tu email — te hemos enviado un link de acceso"
- [ ] Error state inline (no toast): email con formato inválido
- [ ] Ruta `/auth/callback` procesa el magic link y redirige a `/communities`
- [ ] Si el email no existe, Supabase crea la cuenta automáticamente (FR2)
- [ ] Magic link anterior se invalida al generar uno nuevo (FR4)
- [ ] Magic link entregado en < 30s bajo condiciones normales (NFR-P1)
- [ ] Usuario no autenticado que intenta acceder a ruta protegida → redirect a `/login`
- [ ] Usuario autenticado que accede a `/login` → redirect a `/communities`

### Criterios de Rechazo

- [ ] NO debe existir formulario de registro separado
- [ ] NO debe existir campo de contraseña en ningún momento
- [ ] NO debe haber toast de error — solo mensajes inline

### Notas Técnicas

- Supabase Auth gestiona magic link nativo
- SMTP: configurar Resend como provider SMTP en Supabase Auth dashboard
- `app/login/page.tsx` — Server Component con formulario client-side
- `app/auth/callback/route.ts` — Route Handler para el callback
- Componente: `components/auth/LoginForm.tsx` (Client Component)

---

## Story 1.3: Auth Middleware & Route Protection

**Como** plataforma,
**quiero** que las rutas privadas sean inaccesibles sin sesión autenticada,
**para que** ningún usuario no autenticado pueda ver contenido de la plataforma (NFR-S4).

### Criterios de Aceptación

- [ ] `middleware.ts` intercepta todas las rutas excepto `/`, `/login`, `/auth/callback`
- [ ] Petición sin sesión válida a ruta protegida → redirect 302 a `/login`
- [ ] Petición con sesión válida pasa sin modificación
- [ ] Sesión verificada con `getUser()` — NUNCA `getSession()` (NFR-S3)
- [ ] Headers de sesión refrescados automáticamente en cada request
- [ ] RLS en Supabase activo — acceso a datos de comunidad restringido a miembros

### Notas Técnicas

- `lib/supabase/middleware.ts` usando `createServerClient` de `@supabase/ssr`
- Matcher en `middleware.ts` excluye rutas públicas y assets estáticos
- ESLint enforce: `no-restricted-syntax` bloqueando `getSession()` globalmente
