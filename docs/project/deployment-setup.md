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
    └── job: deploy (needs: quality)
        ├── supabase db push (aplica migraciones)
        └── vercel deploy --prod

Vercel (región: mad1 — Madrid)
    └── Next.js App Router (Node.js 24)
            │
            └── Supabase (PostgreSQL + Auth)
                    └── Resend (magic links via SMTP)
```

---

## Ficheros de configuración

| Fichero | Propósito |
|---------|-----------|
| `vercel.json` | Configuración de Vercel: región, build commands, security headers |
| `.env.example` | Plantilla de variables de entorno (se commitea al repo) |
| `.github/workflows/ci.yml` | Pipeline de CI en PRs: lint + test + security scans |
| `.github/workflows/deploy.yml` | Pipeline de deploy en push a main: quality → deploy |

---

## Variables de entorno

Configurar en **Vercel Dashboard → proyecto → Settings → Environment Variables**:

| Variable | Descripción | Entorno |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Production |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública de Supabase | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service role (solo servidor) — sensitive | Production |
| `RESEND_API_KEY` | API key de Resend para emails — sensitive | Production |
| `NEXT_PUBLIC_SITE_URL` | URL pública de la app en Vercel | Production |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` y `RESEND_API_KEY` marcados como sensitive (write-only en Vercel).
> `NODE_ENV` no hace falta — Vercel lo pone automáticamente en producción.

---

## Secrets de GitHub Actions

Configurar en **github.com/TaleorSwift/proof-day/settings/secrets/actions**:

| Secret | Descripción | Valor |
|--------|-------------|-------|
| `VERCEL_TOKEN` | Token de autenticación de Vercel | vercel.com/account/tokens |
| `VERCEL_ORG_ID` | ID del equipo en Vercel | `team_CYk3AxQL5XNPnKWkkSHtazgu` |
| `VERCEL_PROJECT_ID` | ID del proyecto en Vercel | `prj_u9KL8QtpWiZKw7KZWi2vm8LjY0Nc` |
| `SUPABASE_ACCESS_TOKEN` | Token personal de Supabase CLI | supabase.com/dashboard/account/tokens |
| `SUPABASE_PROJECT_REF` | Ref del proyecto Supabase | `igjcnthjbfkqizmvrclr` |
| `GITHUB_TOKEN` | Token automático de GitHub | Inyectado automáticamente |

---

## Primer despliegue (setup completado)

El proyecto ya está vinculado a Vercel y todos los secrets configurados.
El primer deploy se disparará automáticamente en el próximo merge a `main`.

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
git push origin main          → dispara deploy.yml (quality → deploy a Vercel)
```

---

## Coste estimado

| Servicio | Plan | Coste |
|----------|------|-------|
| Vercel | Hobby (gratis hasta límite) | $0 |
| Supabase | Free tier (500MB DB, 2GB bandwidth) | $0 (MVP) |
| GitHub Actions | 2000 min/mes gratis en repos públicos | $0 |
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

---

## Troubleshooting

### Deploy falla en `supabase db push`
- Verificar que `SUPABASE_ACCESS_TOKEN` y `SUPABASE_PROJECT_REF` están en GitHub Secrets
- Verificar migraciones pendientes: `supabase migration list`

### Deploy falla en Vercel
- Verificar `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` en GitHub Secrets
- Revisar logs en Vercel Dashboard → proyecto → Deployments

### Trivy bloquea el pipeline
- Revisar el CVE reportado: `trivy fs . --severity CRITICAL,HIGH`
- Actualizar la dependencia afectada: `npm update <package>`
- Si es un falso positivo: añadir excepción en `.trivyignore`

### Gitleaks detecta un secret
- Revocar el secret inmediatamente en el proveedor correspondiente
- Limpiar el historial: `git filter-repo` o BFG Repo Cleaner
- Generar nuevas credenciales y configurarlas en los secrets de GitHub

---

## Comandos útiles

```bash
# Scan de seguridad local
trivy fs . --severity CRITICAL,HIGH
gitleaks detect --source . --verbose
semgrep scan --config p/nextjs --config p/owasp-top-ten

# Ver logs de deploy en Vercel
vercel logs --prod

# Gestionar variables de entorno
vercel env ls production
vercel env add <VARIABLE> production
```
