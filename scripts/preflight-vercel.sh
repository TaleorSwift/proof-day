#!/bin/bash
# =============================================================================
# Pre-Flight Check — proof-day (Vercel + Supabase)
# =============================================================================
# Valida que el proyecto está listo para deploy en Vercel antes de hacer push.
#
# Uso:
#   chmod +x scripts/preflight-vercel.sh
#   ./scripts/preflight-vercel.sh
#
# Códigos de salida:
#   0 — Todos los checks pasaron
#   1 — Fallos críticos (NO hacer deploy)
#   2 — Advertencias (deploy con precaución)
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CRITICAL_FAILURES=0
WARNINGS=0
CHECKS_PASSED=0

header() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

pass() {
  echo -e "  ${GREEN}PASS${NC}: $1"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
}

fail() {
  echo -e "  ${RED}FAIL${NC}: $1"
  echo -e "       ${RED}Fix${NC}: $2"
  CRITICAL_FAILURES=$((CRITICAL_FAILURES + 1))
}

warn() {
  echo -e "  ${YELLOW}WARN${NC}: $1"
  echo -e "       ${YELLOW}Sugerencia${NC}: $2"
  WARNINGS=$((WARNINGS + 1))
}

# =============================================================================
# CHECK 1: Ficheros de configuración requeridos
# =============================================================================
header "1. Ficheros de configuración"

if [ -f ".env.example" ]; then
  pass ".env.example existe"
else
  fail ".env.example no encontrado" \
    "Crear .env.example con todas las variables documentadas"
fi

if [ -f "vercel.json" ]; then
  pass "vercel.json existe"
else
  fail "vercel.json no encontrado" \
    "Crear vercel.json con framework=nextjs y security headers"
fi

if [ -f ".github/workflows/deploy.yml" ]; then
  pass ".github/workflows/deploy.yml existe"
else
  fail ".github/workflows/deploy.yml no encontrado" \
    "Crear el pipeline de deploy para GitHub Actions"
fi

if [ -f ".github/workflows/ci.yml" ]; then
  pass ".github/workflows/ci.yml existe"
else
  warn ".github/workflows/ci.yml no encontrado" \
    "Se recomienda un pipeline de CI separado para PRs"
fi

# =============================================================================
# CHECK 2: Variables de entorno documentadas en .env.example
# =============================================================================
header "2. Variables de entorno en .env.example"

REQUIRED_VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "RESEND_API_KEY"
  "NEXT_PUBLIC_SITE_URL"
  "CRON_SECRET"
  "ANTHROPIC_API_KEY"
  "AI_DAILY_BUDGET_USD"
)

for var in "${REQUIRED_VARS[@]}"; do
  if grep -q "^${var}" .env.example 2>/dev/null; then
    pass "${var} documentada en .env.example"
  else
    fail "${var} NO está en .env.example" \
      "Añadir ${var} a .env.example con comentario de dónde obtenerla"
  fi
done

# =============================================================================
# CHECK 3: .env.local o .env.local.example no commiteado
# =============================================================================
header "3. Seguridad de secrets"

if git check-ignore -q .env.local 2>/dev/null; then
  pass ".env.local está en .gitignore"
elif [ -f ".gitignore" ] && grep -qE "^\.env\.local$|^\.env\*" .gitignore 2>/dev/null; then
  pass ".env.local está en .gitignore"
else
  fail ".env.local no está en .gitignore — secrets en riesgo" \
    "Añadir .env.local a .gitignore"
fi

# Verificar que no hay secrets reales en .env.example
if grep -qE "^ANTHROPIC_API_KEY=sk-ant-" .env.example 2>/dev/null; then
  fail "ANTHROPIC_API_KEY tiene valor real en .env.example" \
    "Dejar ANTHROPIC_API_KEY= vacío en .env.example (nunca con valor real)"
else
  pass "ANTHROPIC_API_KEY sin valor real en .env.example"
fi

if grep -qE "^SUPABASE_SERVICE_ROLE_KEY=eyJ" .env.example 2>/dev/null; then
  fail "SUPABASE_SERVICE_ROLE_KEY tiene valor real en .env.example" \
    "Dejar SUPABASE_SERVICE_ROLE_KEY= vacío en .env.example"
else
  pass "SUPABASE_SERVICE_ROLE_KEY sin valor real en .env.example"
fi

# Verificar que no hay PAT embebido en el remote de git
if git remote -v 2>/dev/null | grep -qE "https://[^@]+@"; then
  warn "La URL del remote de git contiene credenciales embebidas (PAT)" \
    "Ejecutar: git remote set-url origin https://github.com/TaleorSwift/proof-day.git"
else
  pass "URL del remote de git sin credenciales embebidas"
fi

# =============================================================================
# CHECK 4: GitHub Actions Secrets documentados
# =============================================================================
header "4. GitHub Actions Secrets (verificación documental)"

REQUIRED_SECRETS=(
  "VERCEL_TOKEN"
  "VERCEL_ORG_ID"
  "VERCEL_PROJECT_ID"
  "SUPABASE_ACCESS_TOKEN"
  "SUPABASE_PROJECT_REF"
  "SUPABASE_DB_PASSWORD"
)

DEPLOYMENT_DOC="docs/project/deployment-setup.md"
if [ -f "$DEPLOYMENT_DOC" ]; then
  for secret in "${REQUIRED_SECRETS[@]}"; do
    if grep -q "$secret" "$DEPLOYMENT_DOC" 2>/dev/null; then
      pass "${secret} documentado en deployment-setup.md"
    else
      warn "${secret} no aparece en deployment-setup.md" \
        "Documentar el secret en docs/project/deployment-setup.md"
    fi
  done
else
  warn "No se encontró docs/project/deployment-setup.md" \
    "Crear el documento de deployment con la lista de secrets"
fi

# =============================================================================
# CHECK 5: Alineación con arquitectura
# =============================================================================
header "5. Alineación con architecture.md"

ARCH_FILE="_bmad-output/planning-artifacts/architecture.md"
if [ -f "$ARCH_FILE" ]; then
  pass "Documento de arquitectura encontrado"

  if grep -qi "vercel" "$ARCH_FILE" 2>/dev/null; then
    if [ -f "vercel.json" ]; then
      pass "Plataforma Vercel alineada con architecture.md"
    else
      fail "architecture.md dice Vercel pero falta vercel.json" \
        "Crear vercel.json con la configuración de Vercel"
    fi
  fi

  if grep -qi "supabase" "$ARCH_FILE" 2>/dev/null; then
    if [ -f "supabase/config.toml" ]; then
      pass "Supabase CLI configurado (supabase/config.toml)"
    else
      warn "supabase/config.toml no encontrado" \
        "Ejecutar: supabase init para configurar Supabase CLI"
    fi
  fi
else
  warn "No se encontró $ARCH_FILE" \
    "El preflight no puede verificar la alineación arquitectónica"
fi

# =============================================================================
# CHECK 6: Build verificable localmente
# =============================================================================
header "6. Build local"

if [ -f "package.json" ]; then
  pass "package.json existe"

  if grep -q '"build"' package.json 2>/dev/null; then
    pass "Script 'build' definido en package.json"
  else
    fail "Script 'build' no encontrado en package.json" \
      "Añadir 'build': 'next build' a los scripts de package.json"
  fi

  if grep -q '"lint"' package.json 2>/dev/null; then
    pass "Script 'lint' definido en package.json"
  else
    warn "Script 'lint' no encontrado en package.json" \
      "Añadir 'lint': 'next lint' a los scripts de package.json"
  fi

  if [ -f "next.config.ts" ] || [ -f "next.config.js" ]; then
    pass "Fichero de configuración de Next.js encontrado"
  else
    fail "next.config.ts / next.config.js no encontrado" \
      "Crear la configuración de Next.js en la raíz del proyecto"
  fi
else
  fail "package.json no encontrado" \
    "El proyecto no tiene package.json — verificar la raíz del repositorio"
fi

# =============================================================================
# RESUMEN
# =============================================================================
header "RESUMEN PREFLIGHT"

TOTAL=$((CHECKS_PASSED + CRITICAL_FAILURES + WARNINGS))
echo ""
echo -e "  ${GREEN}Pasados${NC}:    $CHECKS_PASSED"
echo -e "  ${RED}Fallidos${NC}:   $CRITICAL_FAILURES"
echo -e "  ${YELLOW}Avisos${NC}:     $WARNINGS"
echo -e "  Total:      $TOTAL checks"
echo ""

if [ "$CRITICAL_FAILURES" -gt 0 ]; then
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}  PREFLIGHT FALLIDO — NO HACER DEPLOY${NC}"
  echo -e "${RED}  Corregir $CRITICAL_FAILURES error(es) crítico(s) antes de desplegar.${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 1
elif [ "$WARNINGS" -gt 0 ]; then
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}  PREFLIGHT APROBADO CON AVISOS${NC}"
  echo -e "${YELLOW}  Revisar $WARNINGS aviso(s) antes de desplegar.${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 2
else
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}  PREFLIGHT APROBADO — LISTO PARA DEPLOY${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 0
fi
