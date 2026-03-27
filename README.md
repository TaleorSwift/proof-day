# Proof Day

Plataforma de validacion de ideas para builders. Los builders presentan proyectos, la comunidad da feedback estructurado y el sistema calcula el Proof Score.

## Stack

- Next.js 15 (App Router)
- Supabase (PostgreSQL + Auth + RLS)
- Tailwind CSS + shadcn/ui
- Vercel (deploy)
- Resend (emails)

## Requisitos

- Node.js 20.11+
- npm 10+
- Cuenta en Supabase
- Cuenta en Resend (para magic links de invitacion)

## Setup

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd proof-day
npm install
```

### 2. Configurar variables de entorno

Copiar `.env.example` a `.env.local` y rellenar los valores:

```bash
cp .env.example .env.local
```

Variables requeridas:

```bash
# Supabase — obtener en https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...  # o ANON_KEY del dashboard
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...              # solo en servidor

# Resend — obtener en https://resend.com/api-keys
RESEND_API_KEY=re_xxx

# URL pública de la app — para magic links
NEXT_PUBLIC_SITE_URL=http://localhost:3000        # en producción: tu dominio real
```

### 4. Configurar Resend SMTP en Supabase Auth (magic links)

Supabase Auth gestiona el envío de magic links. Para usar Resend como proveedor SMTP:

1. Ir a Supabase Dashboard → **Authentication → SMTP Settings**
2. Activar "Enable custom SMTP"
3. Configurar:
   - **Host**: `smtp.resend.com`
   - **Port**: `465` (SSL)
   - **Username**: `resend`
   - **Password**: tu `RESEND_API_KEY`
   - **Sender name**: `Proof Day`
   - **Sender email**: `noreply@tudominio.com`
4. Guardar y verificar el dominio en Resend si es necesario

> No requiere código adicional en la app — Supabase gestiona el envío completamente.

### 3. Iniciar desarrollo

```bash
npm run dev        # servidor en http://localhost:3000
```

## Comandos

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de produccion |
| `npm run lint` | Lint con ESLint |
| `npm run test` | Tests unitarios con Vitest |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:e2e` | Tests E2E con Playwright (requiere servidor corriendo) |
| `npm run storybook` | Storybook en http://localhost:6006 |
| `npm run build-storybook` | Build de Storybook |

## Estructura de carpetas

```
proof-day/
├── app/                     # Next.js App Router
│   ├── globals.css          # Design tokens + Tailwind
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/                  # shadcn/ui (NO editar)
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Client Components
│   │   ├── server.ts        # Server Components + API Routes
│   │   └── middleware.ts    # Middleware auth
│   ├── api/                 # Funciones de acceso a datos
│   ├── validations/         # Schemas Zod
│   └── utils/               # Utilidades generales
├── types/
│   └── index.ts             # Tipos TypeScript base
├── supabase/
│   └── migrations/          # Migraciones SQL
├── tests/
│   ├── unit/                # Tests Vitest
│   └── e2e/                 # Tests Playwright
├── stories/                 # Storybook stories
└── middleware.ts             # Auth gate
```

## Reglas de codigo

- **Supabase**: no importar `@supabase/supabase-js` ni `@supabase/ssr` directamente. Usar `lib/supabase/` para clients y `lib/api/` desde componentes.
- **Session**: usar `getClaims()` o `getUser()`. NUNCA `getSession()`.
- **Commits**: seguir Conventional Commits. Husky + commitlint lo enforzan.
- **Design tokens**: usar siempre CSS variables de `docs/project/design-tokens.md`. Sin valores hardcodeados.

## Gitflow

- `main` — produccion
- `develop` — desarrollo activo
- `feat/X-Y-descripcion` — feature branches desde develop

## Documentacion

- Arquitectura: `_bmad-output/planning-artifacts/architecture.md`
- Design tokens: `docs/project/design-tokens.md`
- Stories: `_bmad-output/implementation-artifacts/stories/`
