# Deployment Setup — proof-day

**Plataforma:** Vercel
**CI/CD:** GitHub Actions
**Repositorio:** github.com/TaleorSwift/proof-day
**Fecha de configuración:** 2026-03-28

---

## Arquitectura de despliegue

```
GitHub (rama main)
    │
    ▼
GitHub Actions — deploy.yml
    │
    ├── job: quality
    │   ├── Lint (ESLint + TypeScript)
    │   ├── Tests (Vitest)
    │   ├── npm audit (vulnerabilidades de dependencias)
    │   ├── Gitleaks (detección de secrets)
    │   ├── Semgrep (SAST — análisis estático)
    │   └── Trivy filesystem scan (CVEs)
    │
    ├── job: docker (needs: quality)
    │   ├── Build imagen multi-stage (Node 20 Alpine)
    │   ├── Push a ghcr.io/taleorswift/proof-day
    │   │   ├── :sha-<commit>
    │   │   └── :latest
    │   └── Trivy image scan (CVEs en imagen final)
    │
    └── job: deploy (needs: docker)
        ├── supabase db push (aplica migraciones)
        └── vercel deploy --prod

Vercel (región: mad1 — Madrid)
    └── Next.js App Router (Node.js 20)
            │
            └── Supabase (PostgreSQL + Auth)
                    └── Resend (magic links via SMTP)
```

---

## Ficheros generados

| Fichero | Propósito |
|---------|-----------|
| `Dockerfile` | Imagen multi-stage para build reproducible y Trivy scan |
| `.dockerignore` | Excluye ficheros innecesarios del contexto Docker |
| `vercel.json` | Configuración de Vercel: región, build commands, security headers |
| `.env.example` | Plantilla de variables de entorno (se commitea al repo) |
| `.github/workflows/ci.yml` | Pipeline de CI en PRs: lint + test + security scans |
| `.github/workflows/deploy.yml` | Pipeline de deploy en push a main: quality → docker → deploy |
| `next.config.ts` | `output: "standalone"` para imagen Docker mínima |

---

## Variables de entorno

Configurar en **Vercel Dashboard → proyecto → Settings → Environment Variables**:

| Variable | Descripción | Entorno |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Production |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública de Supabase | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service role (solo servidor) | Production |
| `RESEND_API_KEY` | API key de Resend para emails | Production |
| `NEXT_PUBLIC_SITE_URL` | URL pública de la app en Vercel | Production |
| `NODE_ENV` | `production` | Production |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` y `RESEND_API_KEY` son secretos — nunca en variables `NEXT_PUBLIC_*`.

---

## Secrets de GitHub Actions

Configurar en **github.com/TaleorSwift/proof-day/settings/secrets/actions**:

| Secret | Descripción | Dónde obtenerlo |
|--------|-------------|-----------------|
| `VERCEL_TOKEN` | Token de autenticación de Vercel | vercel.com/account/tokens |
| `VERCEL_ORG_ID` | ID del equipo/organización en Vercel | Vercel → Settings → General → Team ID |
| `VERCEL_PROJECT_ID` | ID del proyecto en Vercel | Vercel → proyecto → Settings → General |
| `SUPABASE_ACCESS_TOKEN` | Token personal de Supabase CLI | supabase.com/dashboard/account/tokens |
| `SUPABASE_DB_PASSWORD` | Contraseña de la base de datos | Supabase → proyecto → Settings → Database |
| `GITHUB_TOKEN` | Token automático de GitHub | Inyectado automáticamente por GitHub Actions |

---

## Primer despliegue (setup manual)

Antes del primer deploy automático, ejecutar una vez desde local:

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Vincular proyecto a Vercel (genera .vercel/project.json)
vercel link

# 3. Obtener los IDs para los secrets de GitHub
cat .vercel/project.json
# → orgId → VERCEL_ORG_ID
# → projectId → VERCEL_PROJECT_ID

# 4. Instalar Supabase CLI
npm i -g supabase

# 5. Login en Supabase
supabase login
# → genera el SUPABASE_ACCESS_TOKEN

# 6. Aplicar migraciones iniciales
supabase db push
```

---

## Flujo de trabajo diario

```
# Desarrollo normal
git checkout develop
# ... cambios ...
git push origin develop       → dispara ci.yml (lint + test + security)

# Pull Request a main
# → ci.yml valida la PR automáticamente

# Merge a main
git checkout main
git merge develop
git push origin main          → dispara deploy.yml (quality → docker → deploy)
```

---

## Coste estimado

| Servicio | Plan | Coste |
|----------|------|-------|
| Vercel | Hobby (gratis hasta límite) / Pro si se necesita team | $0 / $20 mes |
| Supabase | Free tier (500MB DB, 2GB bandwidth) | $0 (MVP) |
| GitHub Actions | 2000 min/mes gratis en repos públicos | $0 |
| ghcr.io | Gratis para repos públicos, 500MB para privados | $0 (MVP) |
| Resend | 3000 emails/mes gratis | $0 (MVP) |

**Total estimado MVP:** $0/mes (dentro de free tiers)

---

## Security pipeline

| Herramienta | Qué detecta | Cuándo falla |
|-------------|-------------|--------------|
| `npm audit` | Vulnerabilidades en dependencias npm | CRITICAL/HIGH |
| Gitleaks | Secrets y API keys en código/git history | Cualquier secret detectado |
| Semgrep | Vulnerabilidades OWASP, patrones inseguros Next.js/TS | Reglas p/nextjs + p/owasp-top-ten |
| Trivy (fs) | CVEs en sistema de ficheros y dependencias | CRITICAL/HIGH |
| Trivy (image) | CVEs en imagen Docker final | CRITICAL/HIGH |

---

## Troubleshooting

### Deploy falla en `supabase db push`
- Verificar que `SUPABASE_ACCESS_TOKEN` y `SUPABASE_DB_PASSWORD` están configurados en GitHub Secrets
- Verificar que hay migraciones pendientes: `supabase migration list`

### Deploy falla en Vercel
- Verificar `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` en GitHub Secrets
- Revisar logs en Vercel Dashboard → proyecto → Deployments

### Trivy bloquea el pipeline
- Revisar el CVE reportado: `trivy fs . --severity CRITICAL,HIGH`
- Actualizar la dependencia afectada: `npm update <package>`
- Si es un falso positivo: añadir excepción en `.trivyignore`

### Gitleaks detecta un secret
- El secret está en el código o en el historial de git
- Revocar el secret inmediatamente en el proveedor correspondiente
- Limpiar el historial: `git filter-repo` o BFG Repo Cleaner
- Generar nuevas credenciales y configurarlas en los lugares correctos

### Build Docker falla
- Verificar que `output: "standalone"` está en `next.config.ts`
- Verificar que las variables de entorno de build están disponibles
- Revisar logs: `docker build . --progress=plain`

---

## Comandos útiles

```bash
# Build local
docker build -t proof-day:local .

# Run local con variables de entorno
docker run --env-file .env -p 3000:3000 proof-day:local

# Scan de seguridad local
trivy fs . --severity CRITICAL,HIGH
gitleaks detect --source . --verbose
semgrep scan --config p/nextjs --config p/owasp-top-ten

# Ver logs de deploy en Vercel
vercel logs --prod
```
