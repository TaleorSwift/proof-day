// Story 13.5 — Notificar al Reviewer que su feedback fue atribuido a una iteración
// Fire-and-forget: no bloquea la respuesta de la API.
// Usa createAdminClient() (service role) para bypasear RLS en notifications.

import { createAdminClient } from '@/lib/supabase/admin'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface NotifyFeedbackAttributedParams {
  reviewerId: string
  projectId: string
  projectSlug: string
  projectTitle: string
  versionNumber: number
  communitySlug: string
}

// ── Función principal ─────────────────────────────────────────────────────────

/**
 * Notifica al Reviewer que su feedback quedó atribuido a una iteración
 * específica del proyecto.
 *
 * - Usa createAdminClient() (service role) para bypasear RLS.
 * - No bloquea la respuesta de la API — llamar con `void`.
 * - Captura errores con console.error — no propaga la excepción.
 */
export async function notifyFeedbackAttributed(
  params: NotifyFeedbackAttributedParams
): Promise<void> {
  try {
    const adminClient = createAdminClient()
    const { error } = await adminClient.from('notifications').insert({
      user_id: params.reviewerId,
      type: 'feedback_attributed',
      payload: {
        projectId: params.projectId,
        projectSlug: params.projectSlug,
        projectTitle: params.projectTitle,
        versionNumber: params.versionNumber,
        communitySlug: params.communitySlug,
      },
      read: false,
    })

    if (error) {
      console.error('[notifyFeedbackAttributed] Error inserting notification:', error)
    }
  } catch (err) {
    console.error('[notifyFeedbackAttributed] Error al crear notificación:', err)
  }
}
