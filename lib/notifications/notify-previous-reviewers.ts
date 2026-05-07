// Story 13.3 — Notificar a reviewers anteriores cuando hay nueva versión
// Fire-and-forget: no bloquea la respuesta de la API.
// Usa createAdminClient() (service role) para bypasear RLS en notifications.

import { createAdminClient } from '@/lib/supabase/admin'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface NotifyPreviousReviewersParams {
  projectId: string
  builderId: string
  projectSlug: string
  projectTitle: string
  versionNumber: number
  communitySlug: string
}

// ── Función principal ─────────────────────────────────────────────────────────

/**
 * Notifica a todos los reviewers anteriores del proyecto que hay una nueva
 * versión disponible.
 *
 * - Usa createAdminClient() (service role) para bypasear RLS.
 * - No bloquea la respuesta de la API — llamar con `void`.
 * - Omite duplicados: si ya existe una notificación new_iteration_ready
 *   para ese user/project/version, no crea otra.
 * - Omite al Builder (builderId).
 * - Captura errores con console.error — no propaga la excepción.
 */
export async function notifyPreviousReviewers(
  params: NotifyPreviousReviewersParams
): Promise<void> {
  try {
    const adminClient = createAdminClient()

    // 1. Obtener reviewer_ids distintos del builder
    const { data: reviewerRows } = await adminClient
      .from('feedbacks')
      .select('reviewer_id')
      .eq('project_id', params.projectId)
      .neq('reviewer_id', params.builderId)

    if (!reviewerRows?.length) return

    // 2. Deduplicar reviewer_ids
    const uniqueReviewerIds = [
      ...new Set(
        (reviewerRows ?? []).map((r: { reviewer_id: string }) => r.reviewer_id)
      ),
    ]

    // 3. Para cada reviewer, verificar dedup y crear notificación
    for (const reviewerId of uniqueReviewerIds) {
      const { data: existing } = await adminClient
        .from('notifications')
        .select('id')
        .eq('user_id', reviewerId)
        .eq('type', 'new_iteration_ready')
        .contains('payload', {
          projectId: params.projectId,
          versionNumber: params.versionNumber,
        })
        .maybeSingle()

      if (existing) continue

      await adminClient.from('notifications').insert({
        user_id: reviewerId,
        type: 'new_iteration_ready',
        payload: {
          projectId: params.projectId,
          projectSlug: params.projectSlug,
          projectTitle: params.projectTitle,
          versionNumber: params.versionNumber,
          communitySlug: params.communitySlug,
        },
        read: false,
      })
    }
  } catch (err) {
    console.error('[notifyPreviousReviewers] Error al crear notificaciones:', err)
  }
}
