# Story 1.1: Project Setup & Base Infrastructure

Status: ready-for-dev

## Story

Como equipo de desarrollo,
quiero tener el proyecto Next.js 15 configurado con Supabase, ESLint, Husky y las convenciones base,
para que todos los agentes puedan implementar stories sobre una base consistente y enforzada.

## Acceptance Criteria

1. Proyecto creado con `npx create-next-app -e with-supabase proof-day`
2. Variables de entorno configuradas: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`
3. ESLint configurado con regla `no-restricted-imports` que bloquea importación de `@supabase/supabase-js` y `@supabase/ssr` fuera de `lib/supabase/`
4. ESLint configurado con regla `no-restricted-syntax` que bloquea llamadas a `getSession()`
5. Husky + commitlint configurado — commits que no cumplan Conventional Commits son rechazados en pre-commit
6. Tailwind configurado con design tokens de `docs/project/design-tokens.md` en `tailwind.config.ts`
7. CSS custom properties de design tokens aplicadas en `app/globals.css`
8. shadcn/ui inicializado con componentes: Button, Card, Badge, Input, Textarea, Avatar, Dialog, Progress, Skeleton, NavigationMenu, Tabs, ToggleGroup, Tooltip, Separator, Form, Label, DropdownMenu
9. `lib/supabase/client.ts` exporta `createClient()` para Server Components
10. `lib/supabase/server.ts` exporta `createClient()` para API Routes (con cookies)
11. `lib/supabase/middleware.ts` exporta `updateSession()` para middleware
12. `middleware.ts` en raíz creado (placeholder — ruta protection completa en Story 1.3)
13. Estructura de carpetas base creada: `app/`, `components/ui/`, `lib/supabase/`, `lib/api/`, `lib/validations/`, `lib/utils/`, `types/`, `supabase/migrations/`, `tests/unit/`, `tests/e2e/`, `stories/`
14. Vitest configurado y ejecutable con `npm run test`
15. Playwright configurado y ejecutable con `npm run test:e2e`
16. Storybook configurado y ejecutable con `npm run storybook`
17. `types/index.ts` con tipos base: `User`, `Community`, `Project`, `Feedback`, `ProofScore`
18. `README.md` con instrucciones de setup (env vars, comandos de desarrollo)
19. Rama `develop` creada desde `main` — todo desarrollo futuro parte de `develop`
20. Primer commit en `develop` con mensaje `chore(setup): initialize project with Next.js 15 + Supabase`

## Tasks / Subtasks

- [ ] **T1: Inicializar proyecto** (AC: 1, 19)
  - [ ] Ejecutar `npx create-next-app -e with-supabase proof-day`
  - [ ] `cd proof-day && git init` (si no lo hace create-next-app)
  - [ ] Crear rama `develop` desde `main`: `git checkout -b develop`
  - [ ] Verificar que `app/`, `lib/`, `components/ui/` existen del template

- [ ] **T2: Configurar variables de entorno** (AC: 2)
  - [ ] Crear `.env.local` con las 4 variables (valores placeholder — Javi los rellenará)
  - [ ] Crear `.env.example` con los nombres de las variables (sin valores) para el repo
  - [ ] Verificar que `.env.local` está en `.gitignore`
  - [ ] Nota en README: dónde obtener cada variable

- [ ] **T3: Estructura de carpetas base** (AC: 13)
  - [ ] Crear `lib/api/` con ficheros vacíos: `communities.ts`, `projects.ts`, `feedback.ts`, `proof-score.ts`, `profiles.ts`, `gamification.ts`
  - [ ] Crear `lib/validations/` (vacío)
  - [ ] Crear `lib/utils/` (vacío)
  - [ ] Crear `types/index.ts` con tipos base (ver T9)
  - [ ] Crear `supabase/migrations/` (vacío)
  - [ ] Crear `tests/unit/` con `.gitkeep`
  - [ ] Crear `tests/e2e/` con `.gitkeep`
  - [ ] Crear `stories/` con subcarpetas: `auth/`, `communities/`, `projects/`, `feedback/`, `proof-score/`, `profiles/`, `shared/`

- [ ] **T4: Supabase clients** (AC: 9, 10, 11, 12)
  - [ ] Verificar/crear `lib/supabase/client.ts` (el template lo genera — adaptar si necesario)
  - [ ] Verificar/crear `lib/supabase/server.ts` (el template lo genera — adaptar si necesario)
  - [ ] Verificar/crear `lib/supabase/middleware.ts` (el template lo genera — adaptar si necesario)
  - [ ] Crear `middleware.ts` en raíz con `updateSession()` y matcher básico (rutas públicas: `/`, `/auth/callback`)

- [ ] **T5: ESLint — enforcement de anti-patterns** (AC: 3, 4)
  - [ ] Instalar `@typescript-eslint/eslint-plugin` si no está (el template puede incluirlo)
  - [ ] Añadir regla `no-restricted-imports` en `.eslintrc.js` / `eslint.config.mjs`
  - [ ] Añadir regla `no-restricted-syntax` bloqueando `getSession()`
  - [ ] Añadir `no-empty: 'error'` y `no-console: ['warn', { allow: ['error'] }]`
  - [ ] Verificar que ESLint falla con `eslint src/` sobre un archivo de prueba que importe Supabase directamente

- [ ] **T6: Husky + commitlint** (AC: 5)
  - [ ] `npm install --save-dev husky @commitlint/cli @commitlint/config-conventional`
  - [ ] `npx husky init`
  - [ ] Crear `.commitlintrc.json`: `{ "extends": ["@commitlint/config-conventional"] }`
  - [ ] Crear `.husky/commit-msg` hook: `npx --no -- commitlint --edit $1`
  - [ ] Crear `.husky/pre-commit` hook: `npx lint-staged`
  - [ ] Añadir `lint-staged` en `package.json`: `{ "*.{ts,tsx}": ["eslint --fix"] }`
  - [ ] Verificar que `git commit -m "bad message"` es rechazado

- [ ] **T7: Tailwind + design tokens** (AC: 6, 7)
  - [ ] Copiar CSS custom properties de `docs/project/design-tokens.md` a `app/globals.css` dentro de `:root {}`
  - [ ] Actualizar `tailwind.config.ts` con extensión de colores, tipografía, espaciado, radios y sombras de `docs/project/design-tokens.md`
  - [ ] Verificar que `--font-sans` usa system font stack (sin webfonts añadidos)

- [ ] **T8: shadcn/ui** (AC: 8)
  - [ ] Verificar que shadcn/ui ya está instalado por el template
  - [ ] Ejecutar `npx shadcn@latest add button card badge input textarea avatar dialog progress skeleton navigation-menu tabs toggle-group tooltip separator form label dropdown-menu`
  - [ ] Verificar que todos los componentes están en `components/ui/`
  - [ ] NO modificar ningún fichero de `components/ui/` — son generados

- [ ] **T9: Tipos base** (AC: 17)
  - [ ] Crear `types/index.ts` con interfaces TypeScript base:
    ```typescript
    export type ProjectStatus = 'draft' | 'live' | 'inactive'
    export type ProofScoreState = 'Promising' | 'Needs iteration' | 'Weak'
    export type Decision = 'iterate' | 'scale' | 'abandon'
    export type CommunityRole = 'admin' | 'member'

    export interface User {
      id: string
      email: string
      name?: string
      bio?: string
      interests?: string[]
      avatarUrl?: string
      createdAt: string
    }

    export interface Community {
      id: string
      slug: string
      name: string
      description: string
      imageUrl?: string
      createdAt: string
    }

    export interface Project {
      id: string
      communityId: string
      builderId: string
      title: string
      problem: string
      solution: string
      hypothesis: string
      status: ProjectStatus
      decision?: Decision
      decidedAt?: string
      imageUrls: string[]
      createdAt: string
      updatedAt: string
    }

    export interface FeedbackResponse {
      id: string
      projectId: string
      reviewerId: string
      communityId: string
      scores: { p1: 1 | 2 | 3; p2: 1 | 2 | 3; p3: 1 | 2 | 3 }
      textResponses: { p1?: string; p2?: string; p3?: string; p4: string }
      createdAt: string
    }

    export interface ProofScore {
      state: ProofScoreState
      average: number
      feedbackCount: number
    }
    ```

- [ ] **T10: Testing — Vitest** (AC: 14)
  - [ ] Instalar Vitest: `npm install --save-dev vitest @vitejs/plugin-react`
  - [ ] Crear `vitest.config.ts` con setup básico
  - [ ] Añadir script en `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`
  - [ ] Crear test de humo `tests/unit/smoke.test.ts` que pase: `test('setup', () => expect(true).toBe(true))`

- [ ] **T11: Testing — Playwright** (AC: 15)
  - [ ] `npm install --save-dev @playwright/test`
  - [ ] `npx playwright install chromium`
  - [ ] Crear `playwright.config.ts` apuntando a `http://localhost:3000`
  - [ ] Añadir script: `"test:e2e": "playwright test"`
  - [ ] Crear test de humo `tests/e2e/smoke.spec.ts` que visita `/` y verifica que carga

- [ ] **T12: Storybook** (AC: 16)
  - [ ] `npx storybook@latest init` — seleccionar Next.js cuando pregunte el framework
  - [ ] Configurar Storybook para que reconozca CSS variables de globals.css
  - [ ] Añadir script: `"storybook": "storybook dev -p 6006"`, `"build-storybook": "storybook build"`
  - [ ] Crear primera story de ejemplo: `stories/shared/Button.stories.tsx` usando el Button de shadcn/ui

- [ ] **T13: README** (AC: 18)
  - [ ] Escribir `README.md` con: descripción del proyecto, requisitos de setup, variables de entorno necesarias, comandos de desarrollo (`npm run dev`, `npm run test`, `npm run storybook`), estructura de carpetas clave

- [ ] **T14: Commit inicial** (AC: 20)
  - [ ] `git add -A` (verificar que `.env.local` no está incluido)
  - [ ] `git commit -m "chore(setup): initialize project with Next.js 15 + Supabase"`
  - [ ] Verificar que commitlint no rechaza el commit

## Dev Notes

### Stack & Versiones

- **Next.js 15** (App Router) — `npx create-next-app -e with-supabase proof-day`
- **TypeScript** strict mode — ya configurado por el template
- **Supabase JS** `@supabase/supabase-js` + `@supabase/ssr` — ya incluidos en el template
- **Tailwind CSS** — ya configurado por el template
- **shadcn/ui** — ya inicializado por el template (verificar versión compatibilidad)
- **react-hook-form** + **Zod** — instalar en stories que los necesiten (no en esta story)
- **Vitest** — instalar en esta story
- **Playwright** — instalar en esta story
- **Storybook 8** — instalar en esta story

### Supabase Clients — Regla de Oro

```
Client Component  →  lib/api/{dominio}.ts  →  fetch('/api/...')  →  API Route  →  lib/supabase/server.ts
Server Component  →  lib/supabase/client.ts (directamente, corre en servidor)
Middleware        →  lib/supabase/middleware.ts (solo lectura de sesión)
```

**CRÍTICO:** El template `with-supabase` ya crea estos tres clientes. Verificar que existen y no crear duplicados.

### Variables de Entorno

```bash
# .env.local (nunca al repo)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...   # formato 2025+ (antes ANON_KEY)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...               # solo servidor, NUNCA NEXT_PUBLIC_
RESEND_API_KEY=re_xxx
```

**Nota:** El template usa `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (formato 2025+). Si el dashboard de Supabase muestra `ANON_KEY`, es equivalente — ambos nombres funcionan. La epic-1 menciona `ANON_KEY` — usar `PUBLISHABLE_KEY` es el formato actual.

### ESLint — Reglas Críticas a Implementar

```javascript
// eslint.config.mjs o .eslintrc.js
{
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['@supabase/supabase-js', '@supabase/ssr'],
        message: 'No importar Supabase directamente fuera de lib/supabase/. Usa lib/api/ en Client Components.'
      }]
    }],
    'no-restricted-syntax': ['error', {
      selector: "CallExpression[callee.property.name='getSession']",
      message: "Usa getUser() — getSession() no verifica el token con el Auth server y es inseguro."
    }],
    'no-empty': 'error',
    'no-console': ['warn', { allow: ['error'] }]
  }
}
```

**Nota:** El template usa ESLint 9 con `eslint.config.mjs` (flat config). Adaptar la sintaxis si difiere de `.eslintrc.js`.

### Husky + commitlint

```json
// .commitlintrc.json
{ "extends": ["@commitlint/config-conventional"] }
```

```bash
# .husky/commit-msg
npx --no -- commitlint --edit $1
```

Tipos válidos: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`, `perf`
Scopes sugeridos: `setup`, `auth`, `communities`, `projects`, `feedback`, `proof-score`, `profiles`, `gamification`, `landing`

### Tailwind — Design Tokens

Copiar EXACTAMENTE las CSS custom properties de `docs/project/design-tokens.md` a `app/globals.css`.
Copiar la extensión de `tailwind.config.ts` del mismo fichero.
**No añadir webfonts** — usar únicamente `var(--font-sans)` que apunta al system font stack.

### Storybook — Configuración CSS

Storybook necesita importar `app/globals.css` para que las CSS variables estén disponibles en las stories:

```typescript
// .storybook/preview.ts
import '../app/globals.css'
```

### Gitflow

```bash
# Después del primer commit en main:
git checkout -b develop
# Todo desarrollo futuro desde develop
# Los agentes crearán feature branches: feat/1-2-magic-link-authentication
```

### Project Structure Notes

Estructura completa que debe existir al final de esta story:

```
proof-day/
├── app/
│   ├── globals.css          ← design tokens
│   ├── layout.tsx
│   └── page.tsx             ← landing placeholder (se reemplaza en Story 7.1)
├── components/
│   └── ui/                  ← shadcn/ui (solo add, nunca editar)
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── api/
│   │   ├── communities.ts   ← placeholder vacío
│   │   ├── projects.ts
│   │   ├── feedback.ts
│   │   ├── proof-score.ts
│   │   ├── profiles.ts
│   │   └── gamification.ts
│   ├── validations/         ← vacío
│   └── utils/               ← vacío
├── types/
│   └── index.ts             ← tipos base
├── supabase/
│   └── migrations/          ← vacío
├── tests/
│   ├── unit/
│   │   └── smoke.test.ts
│   └── e2e/
│       └── smoke.spec.ts
├── stories/
│   ├── shared/
│   │   └── Button.stories.tsx
│   └── ... (subcarpetas vacías)
├── middleware.ts             ← auth gate placeholder
├── .env.local               ← no al repo
├── .env.example             ← sí al repo
├── .commitlintrc.json
├── .husky/
│   ├── commit-msg
│   └── pre-commit
├── vitest.config.ts
├── playwright.config.ts
├── tailwind.config.ts       ← con design tokens
└── README.md
```

### References

- [Source: architecture.md#Starter Template] — `npx create-next-app -e with-supabase proof-day`
- [Source: architecture.md#Structure Patterns] — estructura de carpetas completa
- [Source: architecture.md#Enforcement] — ESLint rules, Husky setup
- [Source: architecture.md#Infrastructure & Deployment] — Gitflow, Conventional Commits
- [Source: architecture.md#Authentication & Security] — variables de entorno, supabase clients
- [Source: docs/project/design-tokens.md] — CSS custom properties y tailwind config completos
- [Source: epic-1-infraestructura-auth.md#Story 1.1] — criterios de aceptación originales

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
