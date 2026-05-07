// Story 12.5 — PATCH /api/notifications/[id]
// Marca una notificación como leída.
// - Requiere sesión (401 si no hay auth)
// - 404 si la notificación no existe
// - 403 si la notificación pertenece a otro usuario (ownership check explícito)
// - 200 con la notificación actualizada

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notificationFromRow } from '@/lib/types/ai'
import type { NotificationRow } from '@/lib/types/ai'

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

/**
 * PATCH /api/notifications/[id]
 *
 * Protegido con sesión de usuario (cookie-based, RLS).
 * Verifica ownership explícito antes de actualizar (403 si no es el propietario).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params
  const supabase = await createClient()

  // ── Auth check: 401 si no hay sesión ──────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // ── Ownership check: obtener la notificación para verificar propietario ───
  const { data: notification } = await supabase
    .from('notifications')
    .select('id, user_id')
    .eq('id', id)
    .maybeSingle()

  if (!notification) {
    return NextResponse.json({ error: 'Notificación no encontrada' }, { status: 404 })
  }

  if (notification.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ── Parsear body ──────────────────────────────────────────────────────────
  let body: { read?: boolean } = {}
  try {
    body = (await request.json()) as { read?: boolean }
  } catch {
    // Si no hay body, asumimos read: true (marcar como leída)
  }

  const readValue = body.read ?? true

  // ── Actualizar la notificación ────────────────────────────────────────────
  const { data: updated, error: updateError } = await supabase
    .from('notifications')
    .update({ read: readValue })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json(
      { error: 'Error al actualizar la notificación', detail: updateError.message },
      { status: 500 },
    )
  }

  const rows = updated as NotificationRow[] | null
  const updatedNotif = rows?.[0] ? notificationFromRow(rows[0]) : { id, read: readValue }

  return NextResponse.json({ data: updatedNotif }, { status: 200 })
}
