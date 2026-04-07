# Desarrollo local

## Prerequisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Node.js 20+
- `npm install` ejecutado

## Setup inicial (primera vez)

```bash
# 1. Arrancar contenedores Supabase (primera vez descarga ~2 GB de imágenes Docker)
npm run supabase:start

# 2. Copiar las keys que muestra el comando anterior en .env.local
npm run supabase:status
# → API URL:        http://127.0.0.1:54321
# → anon key:       eyJhbGci...
# → service_role key: eyJhbGci...

# 3. Crear .env.local desde la plantilla y rellenar las keys
cp .env.example .env.local
# Editar .env.local con los valores de supabase:status

# 4. Aplicar migraciones y seed data
npm run supabase:reset

# 5. Arrancar la app
npm run dev
```

## Credenciales seed

| Email | Contraseña | Rol en Producto Alpha |
|-------|-----------|----------------------|
| `demo@proofday.local` | `password123` | Admin |
| `sara@proofday.local` | `password123` | Member |

## URLs de servicios locales

| Servicio | URL |
|---------|-----|
| App | http://localhost:3000 |
| Supabase Studio | http://127.0.0.1:54323 |
| Inbucket (email) | http://127.0.0.1:54324 |
| API / REST | http://127.0.0.1:54321 |

## Comandos de infra

```bash
npm run supabase:start   # Arranca los contenedores Docker
npm run supabase:stop    # Para los contenedores (datos persistentes)
npm run supabase:reset   # Resetea la BD y aplica migraciones + seed
npm run supabase:status  # Muestra URLs y API keys actuales
```

## Modos de entorno

El modo se configura en `.env.local`. Siempre se usa `npm run dev`.

| Modo | Configuración en `.env.local` |
|------|-------------------------------|
| Supabase local (Docker) | `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` + keys de `supabase:status` |
| Supabase remoto | `NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co` + keys de producción |
| Mock (sin DB) | `MOCK_MODE=true` y `NEXT_PUBLIC_MOCK_MODE=true` (URL y keys pueden ser dummy) |

## Añadir una migración

```bash
# Crear fichero con el siguiente número secuencial
# Ejemplo: supabase/migrations/011_add_column.sql

# Probar con reset completo
npm run supabase:reset
```

## Troubleshooting

**`supabase start` falla con "port already in use"**
Otro proceso usa el puerto 54321-54324. Parar otros servicios locales o cambiar puertos en `supabase/config.toml`.

**`supabase start` es muy lento**
La primera ejecución descarga imágenes Docker (~2 GB). Ejecuciones posteriores son rápidas.

**Cambios en migraciones no se aplican**
Ejecutar `npm run supabase:reset` — esto borra la BD y la recrea desde cero con todas las migraciones y seed.

**Docker Desktop no está corriendo**
Supabase CLI requiere Docker activo. Abrir Docker Desktop antes de `supabase start`.
