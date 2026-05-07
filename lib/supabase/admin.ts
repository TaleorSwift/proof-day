// Helper para crear el cliente Supabase con service role (bypasea RLS).
// Usar ÚNICAMENTE en contextos de servidor que requieran acceso admin:
//   - API routes / webhooks internos
//   - Cron jobs
//   - lib/ai (tracking de costes, alertas de presupuesto)
//
// NO usar en componentes del cliente ni en rutas que respondan a sesiones de usuario.

import { createClient } from '@supabase/supabase-js'

/**
 * Crea un cliente Supabase con la service role key.
 * Bypasea Row Level Security (RLS) — usar solo en servidor.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
