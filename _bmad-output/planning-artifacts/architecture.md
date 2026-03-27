---
stepsCompleted: [step-01-init, step-02-context, step-03-starter, step-04-decisions, step-05-patterns, step-06-structure, step-07-validation, step-08-complete]
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-03-27'
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/EARS 330514772072812db976d8db34255e2a.md"
  - "_bmad-output/planning-artifacts/Gherkin 33051477207281b1ad6bdf869daf36f9.md"
  - "_bmad-output/planning-artifacts/Briefing 330514772072819ea272e1a58bae097f.md"
workflowType: 'architecture'
project_name: 'proof-day'
user_name: 'Javi'
date: '2026-03-27'
---

# Architecture Decision Document

_Este documento se construye de forma colaborativa paso a paso. Las secciones se añaden progresivamente conforme tomamos decisiones arquitectónicas juntos._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
31 FRs en 7 dominios funcionales: Autenticación (FR1-FR4), Comunidades (FR5-FR8),
Proyectos (FR9-FR15), Feedback (FR16-FR19), Proof Score + Decisión (FR20-FR23),
Perfiles (FR24-FR27), Gamificación (FR28-FR29), Landing (FR30-FR31).

Arquitectónicamente relevante:
- Ciclo principal: Builder crea proyecto → Reviewer envía feedback → Sistema calcula Proof Score → Builder registra decisión. Todo dentro de una comunidad privada.
- Máquina de estados de proyecto: Draft (solo creador) → Live (feedback abierto) → Inactive (visible, sin feedback). Las transiciones son unidireccionales en MVP.
- Feedback como primitivo obligatorio: sin likes, 4 preguntas guiadas. Sin respuesta completa el sistema no registra el feedback. Garantiza calidad de señal por diseño.
- Proof Score es una función derivada: calculada sobre el conjunto de feedbacks cuando count ≥ 3. No almacenada — computada on-demand o cacheada.
- Tokens single-use: magic links e invitation links comparten el mismo patrón de ciclo de vida (generación → uso único → invalidación).

**Non-Functional Requirements:**
- Performance: magic link <30s (NFR-P1), acciones <2s (NFR-P2), LCP <2.5s (NFR-P3)
- Seguridad: tokens criptográficamente impredecibles (NFR-S1), single-use (NFR-S2), RLS para aislamiento de comunidad (NFR-S3), rechazo de acceso no autorizado (NFR-S4), HTTPS + cifrado en reposo (NFR-S5)
- Accesibilidad: HTML semántico + contraste ≥4.5:1 + navegación por teclado (NFR-A1/A2)
- Fiabilidad: >99% uptime (NFR-R1), pérdida de sesión sin pérdida de datos (NFR-R2)

**Scale & Complexity:**
- Primary domain: web_app (Next.js App Router full-stack)
- Complexity level: low
- Estimated architectural components: ~8 dominios
- Stack ya decidido: Next.js App Router + Supabase (PostgreSQL + Auth) + Vercel

### Technical Constraints & Dependencies

- **Supabase Auth**: gestiona magic link nativo — delegar completamente (no implementar)
- **RLS en Supabase**: aislamiento de datos por comunidad a nivel de base de datos. Toda política de visibilidad se implementa aquí, no en capa de aplicación.
- **API Routes de Next.js**: capa de validación entre cliente y Supabase. No se accede a Supabase directamente desde el cliente.
- **Sin real-time**: datos actualizados on navigate/reload. Sin WebSocket ni SSE.
- **Responsive desktop-first**: mobile no es caso de uso prioritario en MVP.
- **Landing pública con SEO**: ruta separada, sin autenticación, optimizada para Core Web Vitals (LCP <2.5s, CLS <0.1).
- **Disponibilidad delegada**: >99% uptime gestionado por Supabase + Vercel. No se implementa infraestructura propia.

### Cross-Cutting Concerns Identified

1. **RLS enforcement**: cada tabla necesita políticas RLS que filtren por membresía de comunidad. Es la frontera de seguridad principal — si falla, falla todo.
2. **Auth gate**: todas las rutas excepto landing y callback de magic link requieren sesión autenticada activa.
3. **Single-use token lifecycle**: magic links e invitation links comparten el patrón generación → validación → invalidación. Lógica centralizable.
4. **Proof Score computation**: función derivada sobre feedbacks de un proyecto. Debe ser coherente y eficiente — candidata a función de BD o capa de servicio.
5. **Community scoping**: toda entidad (proyecto, feedback, perfil) pertenece a una comunidad. Ninguna query puede ignorar este filtro.

## Starter Template Evaluation

### Primary Technology Domain

Web application full-stack — Next.js App Router con Supabase como backend.
Stack definido en PRD: Next.js + Supabase (PostgreSQL + Auth) + API Routes + Vercel.

### Starter Options Considered

- `create-next-app` base: requiere configuración manual de Supabase auth (SSR)
- `create-next-app -e with-supabase` (oficial Supabase/Vercel): incluye auth pattern correcto para App Router. Seleccionado.

### Selected Starter: with-supabase (Supabase + Vercel official template)

**Rationale:** Template oficial mantenido activamente por Supabase y Vercel. Configura correctamente el patrón cookie-based auth necesario para SSR/RSC — el error más común en integraciones Next.js + Supabase. Incluye shadcn/ui listo para usar. Evita deuda técnica desde el día 1.

**Initialization Command:**

```bash
npx create-next-app -e with-supabase proof-day
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:** TypeScript strict mode. Node.js runtime en Vercel.

**Styling Solution:** Tailwind CSS + shadcn/ui. Variables CSS para tokens de diseño. Clases de utilidad como primitivo — sin CSS-in-JS.

**Auth Pattern:** Cookie-based session (no localStorage). Middleware intercepta todas las rutas. Supabase client separado para server components y client components. Clave de entorno: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (formato nuevo 2025+).

**Build Tooling:** Next.js build pipeline. Turbopack disponible en dev.

**Testing Framework:** Vitest (unit + integration) + Playwright (E2E).
- Vitest: tests de lógica de negocio, API routes, funciones de cálculo (Proof Score).
- Playwright: flujos críticos de usuario (auth magic link, submit feedback, ver Proof Score).

**Code Organization:** `app/` directory con App Router. Layouts anidados. Server Actions disponibles como alternativa a API Routes para mutaciones simples.

**Development Experience:** Hot reload vía Turbopack. TypeScript type-checking. ESLint preconfigurado.

**Note:** La inicialización del proyecto con este comando es la primera story de implementación.

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Base de datos (PostgreSQL / Supabase):**
- Tablas: `snake_case` plural — `communities`, `projects`, `feedback_responses`
- Columnas: `snake_case` — `created_at`, `community_id`, `proof_score`
- Claves foráneas: `{tabla_singular}_id` — `community_id`, `project_id`, `user_id`
- Índices: `idx_{tabla}_{columna}` — `idx_projects_community_id`
- IDs: `uuid` generado por Supabase (`gen_random_uuid()`)

**API Routes (Next.js):**
- Recursos: plural, kebab-case — `/api/communities`, `/api/projects`, `/api/proof-score`
- Sub-recursos: `/api/projects/[id]/feedback`, `/api/communities/[id]/invitations`
- Parámetros de ruta: `[id]` (convención Next.js App Router)
- Query params: `camelCase` — `?communityId=`, `?projectId=`

**TypeScript / Código:**
- Variables y funciones: `camelCase` — `getUserProfile`, `proofScore`
- Componentes React: `PascalCase` — `ProofScoreCard`, `FeedbackForm`
- Types e Interfaces: `PascalCase`, sin prefijo `I` — `type Project`, `type FeedbackResponse`
- Constantes: `SCREAMING_SNAKE_CASE` — `PROOF_SCORE_MIN_FEEDBACKS = 3`
- Archivos de componentes: `PascalCase.tsx` — `ProofScoreCard.tsx`
- Archivos de utilidades/hooks: `camelCase.ts` — `useProofScore.ts`, `formatDate.ts`

### Structure Patterns

**Project Organization:**
```
app/
  (auth)/           — rutas de autenticación (login, callback)
  (app)/            — rutas protegidas (requieren sesión)
    dashboard/
    communities/
      [id]/
        projects/
          [projectId]/
  api/              — ÚNICA capa que accede a Supabase SDK desde servidor
    auth/
    communities/
    projects/
    feedback/
    proof-score/
    profiles/
    gamification/

components/
  ui/               — shadcn/ui (generados, no modificar manualmente)
  auth/
  communities/
  projects/
  feedback/
  proof-score/
  profiles/
  shared/           — componentes reutilizables cross-dominio (story obligatoria)

stories/            — Storybook stories por dominio
  auth/
  communities/
  projects/
  feedback/
  proof-score/
  profiles/
  shared/

lib/
  supabase/
    client.ts       — cliente para Server Components (SSR reads)
    server.ts       — cliente para API Routes
    middleware.ts   — cliente para middleware
  api/              — typed fetch wrappers para Client Components
    communities.ts
    projects.ts
    feedback.ts
    proof-score.ts
    profiles.ts
  validations/      — schemas Zod por dominio
  utils/            — utilidades puras (sin side effects)

tests/
  unit/             — Vitest: lógica de negocio, API routes, schemas Zod
  e2e/              — Playwright: flujos críticos de usuario
```

**Supabase access — regla de oro:**
```
Client Component  →  lib/api/{dominio}.ts  →  fetch('/api/...')  →  API Route  →  Supabase SDK
Server Component  →  lib/supabase/client.ts  →  Supabase SDK directamente (corre en servidor)
Middleware        →  lib/supabase/middleware.ts  →  Supabase SDK (solo lectura de sesión)
```

**Storybook:**
- Stories en `/stories/{dominio}/{Componente}.stories.tsx`
- Obligatoria para todo componente en `components/shared/` y componentes reutilizables por dominio
- Cada story cubre: estado base, variantes, loading, error
- Storybook como entorno de desarrollo y review visual sin backend

### Format Patterns

**API Response — Éxito:**
```typescript
// GET single resource
{ data: Project }

// GET collection
{ data: Project[], count: number }

// POST / PUT / PATCH
{ data: Project }

// DELETE
{ success: true }
```

**API Response — Error:**
```typescript
{ error: string, code: string }
// Ejemplo: { error: "No eres miembro de esta comunidad", code: "COMMUNITY_ACCESS_DENIED" }
```

**Error codes:** `SCREAMING_SNAKE_CASE` prefijados por dominio:
`AUTH_*`, `COMMUNITY_*`, `PROJECT_*`, `FEEDBACK_*`, `PROFILE_*`

**HTTP Status codes:**
- `200` — OK (GET, PUT, PATCH exitoso)
- `201` — Created (POST exitoso)
- `400` — Bad Request (validación Zod fallida)
- `401` — Unauthorized (sin sesión)
- `403` — Forbidden (sin permisos sobre el recurso)
- `404` — Not Found
- `500` — Internal Server Error

**Fechas:** ISO 8601 en API (`2026-03-27T10:00:00Z`). Formateadas solo en capa UI.

**JSON fields en API responses:** `camelCase`. Los campos de BD en `snake_case` se mapean a `camelCase` antes de responder.

### Process Patterns

**Auth en API Routes — patrón obligatorio:**
```typescript
const supabase = await createClient() // lib/supabase/server.ts
const { data: { user }, error } = await supabase.auth.getUser()
if (!user) return NextResponse.json(
  { error: 'No autenticado', code: 'AUTH_REQUIRED' },
  { status: 401 }
)
```

**Community membership check — patrón obligatorio antes de operar sobre recursos:**
```typescript
const { data: member } = await supabase
  .from('community_members')
  .select('id')
  .eq('community_id', communityId)
  .eq('user_id', user.id)
  .single()
if (!member) return NextResponse.json(
  { error: 'Acceso denegado', code: 'COMMUNITY_ACCESS_DENIED' },
  { status: 403 }
)
```

**Validación Zod — patrón obligatorio en API Routes:**
```typescript
const result = schema.safeParse(body)
if (!result.success) return NextResponse.json(
  { error: result.error.issues[0].message, code: 'VALIDATION_ERROR' },
  { status: 400 }
)
```

**Typed API Client (lib/api/) — patrón para Client Components:**
```typescript
// lib/api/projects.ts
export async function getProjects(communityId: string): Promise<Project[]> {
  const res = await fetch(`/api/projects?communityId=${communityId}`)
  if (!res.ok) throw new Error((await res.json()).error)
  return (await res.json()).data
}

export async function createProject(data: CreateProjectInput): Promise<Project> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error((await res.json()).error)
  return (await res.json()).data
}
```

**Loading states (Client Components):**
- Usar `loading.tsx` de Next.js para suspense a nivel de ruta
- Para estados locales: `const [isLoading, setIsLoading] = useState(false)`
- Nombre siempre `isLoading` (nunca `loading`, `isFetching`, `isPending`)

**Storybook story — patrón:**
```typescript
// stories/projects/ProjectCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { ProjectCard } from '@/components/projects/ProjectCard'

const meta: Meta<typeof ProjectCard> = { component: ProjectCard }
export default meta

export const Live: StoryObj<typeof ProjectCard> = {
  args: { status: 'live', title: 'Mi proyecto', feedbackCount: 5 }
}
export const Draft: StoryObj<typeof ProjectCard> = {
  args: { status: 'draft', title: 'Mi proyecto', feedbackCount: 0 }
}
export const Loading: StoryObj<typeof ProjectCard> = {
  args: { isLoading: true }
}
```

### Enforcement

**ESLint — bloquea anti-patterns en pre-commit y CI:**
```js
// .eslintrc.js
rules: {
  'no-restricted-imports': ['error', {
    patterns: [{
      group: ['@supabase/supabase-js', '@supabase/ssr'],
      message: 'Client Components no pueden importar Supabase directamente. Usa lib/api/.'
    }]
  }],
  'no-restricted-syntax': ['error', {
    selector: "CallExpression[callee.property.name='getSession']",
    message: "Usa getUser() — getSession() no verifica el token con el Auth server."
  }],
  'no-empty': 'error',
  'no-console': ['warn', { allow: ['error'] }]
}
```

**Vitest — story coverage obligatoria en CI:**
```typescript
// tests/unit/stories-coverage.test.ts
import { glob } from 'glob'
import path from 'path'

test('todo componente shared tiene su story', async () => {
  const components = await glob('components/shared/**/*.tsx')
  const stories = await glob('stories/shared/**/*.stories.tsx')
  const componentNames = components.map(f => path.basename(f, '.tsx'))
  const storyNames = stories.map(f => path.basename(f, '.stories.tsx'))
  const missing = componentNames.filter(c => !storyNames.includes(c))
  expect(missing, `Componentes sin story: ${missing.join(', ')}`).toHaveLength(0)
})
```

**Husky — ejecuta ESLint + tests antes de cada commit:**
```json
// package.json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "vitest run --reporter=verbose"]
}
```

**Tabla de enforcement:**

| Anti-pattern | Mecanismo | Cuándo falla |
|---|---|---|
| Client Component importa Supabase SDK | ESLint `no-restricted-imports` | Pre-commit + CI |
| `getSession()` en servidor | ESLint `no-restricted-syntax` | Pre-commit + CI |
| `try/catch` vacíos | ESLint `no-empty` | Pre-commit + CI |
| Componente shared sin story | Vitest coverage test | CI |
| `SERVICE_ROLE_KEY` en cliente | Next.js por diseño (sin `NEXT_PUBLIC_`) | Build time |
| Commit fuera de Conventional Commits | commitlint + husky | Pre-commit |

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Bloquean implementación):**
- RLS en Supabase activo en todas las tablas — frontera de seguridad principal
- API Routes puro — todas las operaciones de escritura y lectura pasan por `app/api/`
- Zod como capa de validación de inputs en API Routes
- Auth gate via `middleware.ts` — rutas protegidas por defecto

**Important Decisions (Forman la arquitectura):**
- Resend como proveedor de email (magic links vía SMTP + SDK para futuros emails)
- Gitflow como modelo de ramas
- Conventional Commits enforced via commitlint + husky
- OWASP Top 10 como checklist de seguridad obligatorio
- react-hook-form + Zod para formularios

**Deferred Decisions (Post-MVP):**
- APM/observabilidad avanzada — Vercel Analytics suficiente en MVP
- Caching strategy — sin caching en MVP, evaluar en función de adopción real
- Rate limiting en API Routes — no prioritario para comunidad interna en MVP

### Data Architecture

**Migraciones:** Supabase CLI — `supabase migration new {nombre}`. Migraciones versionadas en control de versiones. Aplicadas via `supabase db push` en CI antes de deploy.

**Validación:** Zod en cada API Route para validar el body/params antes de cualquier operación en Supabase. Schemas compartidos entre cliente y servidor donde aplique.

**Caching:** Ninguno en MVP. Datos frescos en cada navegación (alineado con PRD: sin real-time). Supabase gestiona connection pooling de forma transparente.

**ORM/Query:** Supabase JS client (`@supabase/supabase-js`) con queries tipadas. Sin ORM adicional.

### Authentication & Security

**Auth gate:** `middleware.ts` de Next.js intercepta todas las requests. Rutas públicas permitidas: `/` (landing), `/auth/callback`. Todo lo demás requiere sesión activa.

**API Route auth:** Cada API Route llama a `supabase.auth.getUser()` como primera operación. Si no hay sesión válida, responde `401`. No se confía en cookies sin verificar.

**Email — Magic links:** Supabase Auth configurado con SMTP de Resend (`RESEND_SMTP_HOST`, `RESEND_SMTP_USER`, `RESEND_API_KEY`). Los magic links salen por Resend sin código adicional en la aplicación.

**Email — Futuros:** SDK `@resend/node` desde API Routes para notificaciones (Growth/Phase 2).

**OWASP Top 10:**
- **A01 Broken Access Control:** RLS en Supabase + validación de membresía de comunidad en cada API Route. Nunca se confía en el cliente para el scoping.
- **A02 Cryptographic Failures:** HTTPS enforced en Vercel. Cifrado en reposo gestionado por Supabase. Tokens (magic link, invitation) criptográficamente impredecibles vía Supabase Auth.
- **A03 Injection:** Supabase JS client usa queries parametrizadas por defecto. Zod valida y sanitiza todos los inputs antes de cualquier operación.
- **A04 Insecure Design:** Community scoping por diseño (RLS). Single-use tokens. Feedback obligatorio estructurado — no se puede degradar a comportamiento libre.
- **A05 Security Misconfiguration:** Variables de entorno en Vercel dashboard y `.env.local` (nunca en repo). RLS activo en todas las tablas desde el inicio. Service role key nunca expuesta al cliente.
- **A06 Vulnerable Components:** `npm audit` en CI (GitHub Actions). Dependabot para alertas de seguridad en el repo.
- **A07 Authentication Failures:** Magic link single-use + invalidación inmediata tras uso. Cookie-based session (httpOnly). Sin gestión de contraseñas.
- **A08 Software Integrity:** `package-lock.json` commiteado y verificado en CI. Integridad de dependencias críticas auditada.
- **A09 Logging Failures:** Vercel logs para errores de aplicación. Supabase Auth logs para eventos de autenticación. Sin logging de datos sensibles (emails, tokens).
- **A10 SSRF:** API Routes no realizan requests a URLs externas controladas por el usuario en MVP.

### API & Communication Patterns

**Patrón:** API Routes puro — `app/api/{recurso}/route.ts`. Sin Server Actions. Toda mutación y lectura no trivial pasa por API Routes. Separación clara cliente ↔ servidor.

**Estructura de rutas API:**
```
app/api/
  auth/          — callbacks de autenticación
  communities/   — CRUD de comunidades e invitaciones
  projects/      — CRUD de proyectos y cambios de estado
  feedback/      — envío y lectura de feedback
  proof-score/   — cálculo y lectura del Proof Score
  profiles/      — lectura y edición de perfiles
  gamification/  — contadores y rankings
```

**Error handling:** Respuestas tipadas `{ error: string, code: string }` con HTTP status codes estándar. Errores de Supabase mapeados a errores de aplicación antes de exponerlos al cliente. Sin stack traces en producción.

**Variables de entorno requeridas:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY        # Solo en servidor
RESEND_API_KEY
```

### Frontend Architecture

**State management:** React built-in (`useState`, `useContext`). Sin Zustand ni Redux — complejidad de estado no lo justifica en MVP.

**Data fetching:** Server Components para reads (SSR directo a Supabase con sesión del servidor). API Routes para todas las escrituras y operaciones mutantes.

**Form handling:** `react-hook-form` + Zod. Integración nativa con componentes Form de shadcn/ui. Validación client-side + server-side (mismo schema Zod reutilizado).

**Component architecture:** shadcn/ui como base de componentes. Componentes de negocio en `components/{dominio}/`. Componentes UI reutilizables en `components/ui/` (generados por shadcn).

### Infrastructure & Deployment

**Git workflow — Gitflow:**
- Ramas troncales: `main` (producción) y `develop` (integración continua)
- Features: `feature/{descripción-corta}` desde `develop`
- Releases: `release/{semver}` desde `develop` → merge a `main` + `develop` + tag
- Hotfixes: `hotfix/{descripción}` desde `main` → merge a `main` + `develop`
- PRs siempre contra `develop`. Nunca push directo a `main`.

**Commits — Conventional Commits:**
- Formato: `type(scope): description`
- Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`, `perf`
- Enforced via `commitlint` + `husky` (pre-commit hook)
- Habilita generación automática de CHANGELOG y semver automático

**CI/CD:**
- Vercel: auto-deploy de `main` a producción. Preview deployments por PR.
- GitHub Actions: ejecuta `vitest` + `playwright` en cada PR antes de merge.
- `npm audit` en CI para detección de vulnerabilidades en dependencias.

**Environments:**
- `local`: `.env.local` con proyecto Supabase de desarrollo
- `preview`: variables en Vercel por PR (proyecto Supabase compartido de staging)
- `production`: variables en Vercel production (proyecto Supabase de producción)

**Monitoring:**
- Vercel Analytics: métricas de rendimiento y Core Web Vitals (NFR-P3)
- Supabase dashboard: métricas de base de datos, Auth logs, RLS policy hits
- Sin APM adicional en MVP

### Decision Impact Analysis

**Implementation Sequence:**
1. Inicialización del proyecto (`create-next-app -e with-supabase`)
2. Configuración de Gitflow + commitlint + husky
3. Schema de base de datos + migraciones iniciales + RLS policies
4. Auth gate (middleware) + callback de magic link
5. Configuración de Resend como SMTP en Supabase Auth
6. API Routes por dominio (communities → projects → feedback → proof-score → profiles)
7. Server Components + UI por dominio
8. Gamificación (contadores + Top Reviewer)
9. Landing page pública + SEO
10. CI/CD (GitHub Actions + Vercel)

**Cross-Component Dependencies:**
- RLS policies deben estar activas antes de implementar cualquier API Route
- Auth gate debe funcionar antes de implementar cualquier ruta protegida
- Schema de comunidades es prerequisito de proyectos, feedback y perfiles
- Proof Score depende de que feedback esté implementado
- Gamificación depende de feedback (contador) y comunidades (ranking)

## Project Structure & Boundaries

### Complete Project Directory Structure

```
proof-day/
├── .github/
│   └── workflows/
│       ├── ci.yml                    — Vitest + Playwright + ESLint en PRs
│       └── release.yml               — Deploy a producción en merge a main
├── .husky/
│   ├── pre-commit                    — lint-staged (ESLint + commitlint)
│   └── commit-msg                    — commitlint (Conventional Commits)
├── supabase/
│   ├── config.toml
│   └── migrations/
│       ├── 001_create_users.sql
│       ├── 002_create_communities.sql
│       ├── 003_create_projects.sql
│       ├── 004_create_feedback.sql
│       ├── 005_create_invitations.sql
│       └── 006_rls_policies.sql      — RLS para todas las tablas
├── app/
│   ├── globals.css
│   ├── layout.tsx                    — Root layout
│   ├── page.tsx                      — Landing pública (FR30-FR31)
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx              — Solicitud magic link (FR1-FR2)
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts          — Callback Supabase Auth (FR3-FR4)
│   ├── (app)/
│   │   ├── layout.tsx                — Layout protegido (auth gate)
│   │   ├── dashboard/
│   │   │   └── page.tsx              — Home autenticado
│   │   ├── communities/
│   │   │   ├── page.tsx              — Lista de comunidades del usuario (FR8)
│   │   │   ├── new/
│   │   │   │   └── page.tsx          — Crear comunidad (FR5)
│   │   │   └── [id]/
│   │   │       ├── page.tsx          — Vista comunidad + proyectos Live (FR14, FR28-FR29)
│   │   │       ├── settings/
│   │   │       │   └── page.tsx      — Config comunidad + invitaciones (FR6)
│   │   │       └── projects/
│   │   │           ├── new/
│   │   │           │   └── page.tsx  — Crear proyecto (FR9, FR13)
│   │   │           └── [projectId]/
│   │   │               ├── page.tsx  — Vista proyecto + feedback + Proof Score (FR14-FR23)
│   │   │               └── edit/
│   │   │                   └── page.tsx — Editar proyecto Draft (FR10-FR11)
│   │   ├── invitations/
│   │   │   └── [token]/
│   │   │       └── page.tsx          — Unirse a comunidad via link (FR7)
│   │   └── profile/
│   │       ├── page.tsx              — Perfil propio (FR24-FR25)
│   │       └── [userId]/
│   │           └── page.tsx          — Perfil de otro usuario (FR26-FR27)
│   └── api/
│       ├── auth/
│       │   └── route.ts              — Endpoints de auth (FR1-FR4)
│       ├── communities/
│       │   ├── route.ts              — GET (lista) / POST (crear) (FR5, FR8)
│       │   └── [id]/
│       │       ├── route.ts          — GET / DELETE comunidad
│       │       ├── members/
│       │       │   └── route.ts      — GET miembros
│       │       └── invitations/
│       │           └── route.ts      — GET / POST invitation links (FR6-FR7)
│       ├── projects/
│       │   ├── route.ts              — GET (lista) / POST (crear) (FR9, FR14)
│       │   └── [id]/
│       │       ├── route.ts          — GET / PATCH / DELETE (FR10-FR12)
│       │       ├── status/
│       │       │   └── route.ts      — PATCH estado Draft→Live→Inactive (FR11-FR12)
│       │       └── decision/
│       │           └── route.ts      — POST decisión Builder (FR22-FR23)
│       ├── feedback/
│       │   ├── route.ts              — POST enviar feedback (FR16-FR18)
│       │   └── [projectId]/
│       │       └── route.ts          — GET feedback de un proyecto (FR16, FR19)
│       ├── proof-score/
│       │   └── [projectId]/
│       │       └── route.ts          — GET Proof Score calculado (FR20-FR21)
│       ├── profiles/
│       │   ├── route.ts              — GET / PATCH perfil propio (FR24-FR25)
│       │   └── [userId]/
│       │       └── route.ts          — GET perfil de otro usuario (FR26-FR27)
│       └── gamification/
│           └── [communityId]/
│               └── route.ts          — GET contadores + Top Reviewer (FR28-FR29)
├── components/
│   ├── ui/                           — shadcn/ui generados (no modificar)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── auth/
│   │   ├── MagicLinkForm.tsx
│   │   └── AuthGuard.tsx
│   ├── communities/
│   │   ├── CommunityCard.tsx
│   │   ├── CommunityForm.tsx
│   │   ├── InvitationLinkCard.tsx
│   │   └── MemberList.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── ProjectGallery.tsx        — Galería 1-5 imágenes (FR13)
│   │   ├── ProjectStatusBadge.tsx
│   │   └── ProjectDecisionForm.tsx   — Iterar / Escalar / Abandonar (FR22)
│   ├── feedback/
│   │   ├── FeedbackForm.tsx          — 4 preguntas guiadas obligatorias (FR17)
│   │   ├── FeedbackCard.tsx
│   │   └── FeedbackList.tsx
│   ├── proof-score/
│   │   ├── ProofScoreCard.tsx        — Promising / Needs iteration / Weak (FR21)
│   │   └── ProofScoreGate.tsx        — "esperando más feedback" si <3 (FR20)
│   ├── profiles/
│   │   ├── ProfileCard.tsx
│   │   └── ProfileForm.tsx
│   ├── gamification/
│   │   ├── FeedbackCounter.tsx       — Contador personal (FR28)
│   │   └── TopReviewerRanking.tsx    — Ranking comunidad (FR29)
│   ├── landing/
│   │   ├── HeroSection.tsx           — Propuesta de valor (FR30)
│   │   └── AccessRequestForm.tsx     — Solicitud de acceso (FR31)
│   └── shared/
│       ├── ErrorBoundary.tsx
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       └── PageHeader.tsx
├── stories/
│   ├── communities/
│   │   ├── CommunityCard.stories.tsx
│   │   └── InvitationLinkCard.stories.tsx
│   ├── projects/
│   │   ├── ProjectCard.stories.tsx
│   │   ├── ProjectGallery.stories.tsx
│   │   └── ProjectStatusBadge.stories.tsx
│   ├── feedback/
│   │   ├── FeedbackForm.stories.tsx
│   │   └── FeedbackCard.stories.tsx
│   ├── proof-score/
│   │   ├── ProofScoreCard.stories.tsx
│   │   └── ProofScoreGate.stories.tsx
│   ├── gamification/
│   │   ├── FeedbackCounter.stories.tsx
│   │   └── TopReviewerRanking.stories.tsx
│   ├── landing/
│   │   └── HeroSection.stories.tsx
│   └── shared/
│       ├── ErrorBoundary.stories.tsx
│       ├── LoadingSpinner.stories.tsx
│       └── EmptyState.stories.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 — createBrowserClient (Client Components)
│   │   ├── server.ts                 — createServerClient (Server Components / API Routes)
│   │   └── middleware.ts             — createServerClient (middleware.ts)
│   ├── api/                          — Typed fetch wrappers para Client Components
│   │   ├── communities.ts
│   │   ├── projects.ts
│   │   ├── feedback.ts
│   │   ├── proof-score.ts
│   │   ├── profiles.ts
│   │   └── gamification.ts
│   ├── validations/                  — Schemas Zod por dominio
│   │   ├── community.ts
│   │   ├── project.ts
│   │   ├── feedback.ts
│   │   ├── invitation.ts
│   │   └── profile.ts
│   └── utils/
│       ├── proof-score.ts            — Lógica de cálculo del Proof Score
│       ├── dates.ts
│       └── errors.ts                 — Error codes + helpers
├── types/
│   ├── database.ts                   — Tipos generados por Supabase CLI
│   └── index.ts                      — Re-exports + tipos de dominio
├── tests/
│   ├── unit/
│   │   ├── proof-score.test.ts
│   │   ├── validations/
│   │   │   ├── project.test.ts
│   │   │   └── feedback.test.ts
│   │   ├── api/
│   │   │   ├── projects.test.ts
│   │   │   ├── feedback.test.ts
│   │   │   └── invitations.test.ts
│   │   └── stories-coverage.test.ts  — Verifica story por componente shared
│   └── e2e/
│       ├── auth.spec.ts              — Magic link flow (FR1-FR4)
│       ├── community-join.spec.ts    — Invitation link flow (FR6-FR8)
│       ├── project-lifecycle.spec.ts — Draft→Live→Inactive (FR9-FR12)
│       ├── feedback-submit.spec.ts   — Envío feedback guiado (FR16-FR19)
│       └── proof-score.spec.ts       — Proof Score visible ≥3 feedbacks (FR20-FR23)
├── public/
│   ├── images/
│   └── icons/
├── middleware.ts                     — Auth gate (todas las rutas excepto / y /auth/callback)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .eslintrc.js
├── .commitlintrc.js
├── vitest.config.ts
├── playwright.config.ts
├── .storybook/
│   ├── main.ts
│   └── preview.ts
├── .env.example
├── .env.local                        — (git-ignored)
└── package.json
```

### Architectural Boundaries

**API Boundary — Supabase:**
- Único punto de acceso servidor: `lib/supabase/server.ts` desde API Routes y Server Components
- Client Components: siempre via `lib/api/` — nunca Supabase SDK directamente
- Middleware: `lib/supabase/middleware.ts` — solo lectura de sesión

**Component Boundary — Dominio:**
- Cada dominio es autónomo — sin imports cruzados entre dominios
- `components/shared/` es la única fuente de componentes cross-dominio
- `components/ui/` (shadcn) no se modifica manualmente

**Data Boundary — RLS:**
- RLS activo en todas las tablas desde `supabase/migrations/006_rls_policies.sql`
- La policy de comunidad es el filtro primario en todas las tablas de contenido
- `006_rls_policies.sql` es el documento de verdad de seguridad de datos

### Requirements to Structure Mapping

| Dominio (FRs) | API Routes | Components | Tests E2E |
|---|---|---|---|
| Auth (FR1-FR4) | `api/auth/` | `components/auth/` | `auth.spec.ts` |
| Comunidades (FR5-FR8) | `api/communities/` | `components/communities/` | `community-join.spec.ts` |
| Proyectos (FR9-FR15) | `api/projects/` | `components/projects/` | `project-lifecycle.spec.ts` |
| Feedback (FR16-FR19) | `api/feedback/` | `components/feedback/` | `feedback-submit.spec.ts` |
| Proof Score (FR20-FR23) | `api/proof-score/` | `components/proof-score/` | `proof-score.spec.ts` |
| Perfiles (FR24-FR27) | `api/profiles/` | `components/profiles/` | — |
| Gamificación (FR28-FR29) | `api/gamification/` | `components/gamification/` | — |
| Landing (FR30-FR31) | — | `components/landing/` | — |

### Data Flow

```
Browser (Client Component)
  → lib/api/{dominio}.ts           [typed fetch wrapper]
    → app/api/{dominio}/route.ts   [validación Zod + auth check]
      → Supabase SDK               [query con RLS activo]
        → PostgreSQL               [datos filtrados por comunidad]

Browser (Server Component)
  → lib/supabase/client.ts         [SSR client]
    → Supabase SDK                 [query con RLS activo]
      → PostgreSQL                 [datos filtrados por comunidad]
```

### External Integrations

| Servicio | Punto de integración | Variables de entorno |
|---|---|---|
| Supabase Auth | `app/(auth)/auth/callback/route.ts` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| Supabase DB | `lib/supabase/server.ts` | `SUPABASE_SERVICE_ROLE_KEY` |
| Resend (SMTP) | Supabase Auth dashboard config | `RESEND_API_KEY` |
| Vercel | Auto-deploy en push a `main` | (configurado en Vercel dashboard) |

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:** ✅
Next.js 15 + Supabase + TypeScript + Tailwind + shadcn/ui + Vercel sin conflictos de versión. Vitest + Playwright compatibles con Next.js 15. Storybook soporta React/Next.js. commitlint + husky: herramientas Node.js estándar sin incompatibilidades.

**Pattern Consistency:** ✅
`snake_case` BD / `camelCase` TS / `PascalCase` componentes — coherente en toda la arquitectura. API Routes puro + `lib/api/` como capa tipada — patrón sin ambigüedad. Formato de error `{ error, code }` uniforme en todas las API Routes.

**Structure Alignment:** ✅
Estructura `app/` cubre todos los dominios funcionales del PRD. `lib/api/` habilita el patrón cliente → API Routes → Supabase sin excepciones. `supabase/migrations/` soporta el flujo Supabase CLI.

### Requirements Coverage Validation

**Functional Requirements:** ✅ 31/31 FRs cubiertos

| Dominio | FRs | Estado |
|---|---|---|
| Auth | FR1-FR4 | ✅ Supabase Auth + callback route + middleware |
| Comunidades | FR5-FR8 | ✅ API Routes + RLS community scoping |
| Proyectos | FR9-FR15 | ✅ State machine + ProjectGallery + status route |
| Feedback | FR16-FR19 | ✅ FeedbackForm 4 preguntas + validación estado |
| Proof Score | FR20-FR23 | ✅ Algoritmo documentado + ProofScoreGate (≥3) |
| Perfiles | FR24-FR27 | ✅ API Routes + RLS community visibility |
| Gamificación | FR28-FR29 | ✅ FeedbackCounter + TopReviewerRanking |
| Landing | FR30-FR31 | ✅ Server Component con SEO |

**Non-Functional Requirements:** ✅ 10/10 NFRs cubiertos

| NFR | Cobertura |
|---|---|
| NFR-P1 (<30s magic link) | Supabase Auth + Resend SMTP |
| NFR-P2 (<2s acciones) | API Routes + Supabase connection pooling |
| NFR-P3 (LCP <2.5s) | Server Components + Vercel CDN |
| NFR-S1-S5 (Seguridad) | OWASP Top 10 + RLS + HTTPS + cookie-based + single-use tokens |
| NFR-A1-A2 (Accesibilidad) | shadcn/ui semántica + Storybook para review visual |
| NFR-R1 (>99% uptime) | Vercel + Supabase SLAs |
| NFR-R2 (sin pérdida de datos) | Cookie-based session + PostgreSQL transaccional |

### Proof Score Algorithm (ADR)

**Decisión:** El Proof Score se calcula como promedio de las puntuaciones de las 4 preguntas guiadas de feedback. Cada pregunta produce un valor numérico interno 1-5 (no expuesto al usuario).

**Algoritmo:**

```typescript
// lib/utils/proof-score.ts
const PROMISING_THRESHOLD = 4.0
const WEAK_THRESHOLD = 2.5
const MIN_FEEDBACKS = 3  // FR20

function calculateProofScore(feedbacks: FeedbackResponse[]): ProofScore | null {
  if (feedbacks.length < MIN_FEEDBACKS) return null  // "esperando más feedback"

  const average = feedbacks
    .flatMap(f => f.scores)           // array de puntuaciones 1-5
    .reduce((sum, s) => sum + s, 0)
    / (feedbacks.length * 4)          // 4 preguntas por feedback

  if (average >= PROMISING_THRESHOLD) return 'Promising'
  if (average >= WEAK_THRESHOLD)      return 'Needs iteration'
  return 'Weak'
}
```

**Rationale:** Algoritmo simple, testable y determinista. Thresholds ajustables sin cambiar la lógica. Idempotente — mismos inputs, mismo output siempre.

### Gap Analysis Results

**Gaps críticos resueltos:**
- ✅ Proof Score algorithm: documentado con thresholds explícitos y código de referencia

**Gaps menores aceptados:**
- Schema detallado de BD (columnas, tipos): se define en primera story de implementación
- 4 preguntas guiadas de feedback: a definir en story de FeedbackForm (Homer consulta PRD/Javi)

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context analizado (31 FRs, 10 NFRs, 5 concerns transversales)
- [x] Complejidad: low / web_app / greenfield
- [x] Constraints técnicas identificadas
- [x] Cross-cutting concerns mapeados

**Architectural Decisions**
- [x] Stack completo con versiones verificadas
- [x] Auth pattern: cookie-based, Supabase Auth, Resend SMTP
- [x] Data layer: Supabase CLI migrations + Zod + RLS policies
- [x] API pattern: API Routes puro + typed client wrappers
- [x] OWASP Top 10 mapeado a decisiones concretas
- [x] Git workflow: Gitflow + Conventional Commits + commitlint + husky
- [x] Proof Score algorithm: ADR documentado con código de referencia

**Implementation Patterns**
- [x] Naming conventions: BD, API, TypeScript, archivos
- [x] Supabase access layer: client/server/middleware separados
- [x] Error handling: formato uniforme + HTTP status codes
- [x] Enforcement: ESLint + Vitest story coverage + husky
- [x] Storybook: estructura + patrón de stories + CI check

**Project Structure**
- [x] Árbol de directorios completo
- [x] 31 FRs mapeados a rutas/componentes/API Routes específicos
- [x] Integration points y data flow documentados
- [x] Variables de entorno listadas

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** High — todas las decisiones críticas documentadas, patrones enforceables, estructura cubre el 100% de los requisitos.

**Key Strengths:**
- RLS como frontera de seguridad primaria — coherente con OWASP A01/A04
- `lib/api/` como capa tipada — el patrón correcto es la ruta de mínima resistencia
- Proof Score con algoritmo determinista — testable y sin ambigüedad para Homer/Bart
- Storybook + ESLint + Vitest enforced en CI — calidad garantizada por diseño

**Areas for Future Enhancement (post-MVP):**
- Rate limiting en API Routes
- APM avanzado (Sentry) cuando la adopción lo justifique
- Tipos Supabase auto-generados (`supabase gen types`)

### Implementation Handoff

**Primer paso:**
```bash
npx create-next-app -e with-supabase proof-day
```

**Secuencia de implementación:**
1. Init proyecto + Gitflow + commitlint + husky + ESLint config
2. Supabase migrations (schema + RLS policies)
3. Auth gate (middleware) + magic link callback + Resend SMTP config
4. API Routes por dominio (communities → projects → feedback → proof-score → profiles)
5. Server Components + UI por dominio + Storybook stories
6. Gamificación (contadores + Top Reviewer)
7. Landing page + SEO
8. CI/CD (GitHub Actions + Vitest + Playwright)
