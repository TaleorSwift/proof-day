// Story 12.5 — GET /api/notifications
// Devuelve notificaciones del usuario autenticado.
// - Requiere sesión (401 si no hay auth)
// - Por defecto retorna solo no leídas (read=false)
// - ?all=true retorna todas (leídas y no leídas)
// - Máximo 20 notificaciones, ordenadas por created_at DESC

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notificationFromRow } from '@/lib/types/ai'
import type { NotificationRow } from '@/lib/types/ai'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const MAX_NOTIFICATIONS = 20

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

/**
 * GET /api/notifications
 *
 * Protegido con sesión de usuario (cookie-based, RLS).
 * Retorna hasta 20 notificaciones del usuario autenticado, ordenadas DESC.
 * Por defecto filtra por read=false. Con ?all=true retorna todas.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const supabase = await createClient()

  // ── Auth check: 401 si no hay sesión ──────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // ── Determinar si se deben retornar todas o solo no leídas ────────────────
  const url = new URL(request.url)
  const showAll = url.searchParams.get('all') === 'true'

  // ── Consulta a notifications ───────────────────────────────────────────────
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!showAll) {
    query = query.eq('read', false)
  }

  const { data: rows, error } = await query.limit(MAX_NOTIFICATIONS)

  if (error) {
    return NextResponse.json(
      { error: 'Error al obtener notificaciones', detail: error.message },
      { status: 500 },
    )
  }

  const notifications = ((rows as NotificationRow[] | null) ?? []).map(notificationFromRow)

  return NextResponse.json({ data: notifications }, { status: 200 })
}
