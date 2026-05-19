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
  /**
   * ID de la comunidad del proyecto.
   * El helper resuelve internamente el slug con una query admin para no
   * exponer lógica de resolución en el caller (SRP).
   */
  communityId: string
}

// ── Función principal ─────────────────────────────────────────────────────────

/**
 * Notifica al Reviewer que su feedback quedó atribuido a una iteración
 * específica del proyecto.
 *
 * - Resuelve el communitySlug internamente desde communityId (SRP).
 * - Usa createAdminClient() (service role) para bypasear RLS.
 * - Guard: si projectSlug está vacío, no inserta y registra warning.
 * - No bloquea la respuesta de la API — llamar con `void`.
 * - Captura errores con console.error — no propaga la excepción.
 */
export async function notifyFeedbackAttributed(
  params: NotifyFeedbackAttributedParams
): Promise<void> {
  try {
    if (!params.projectSlug) {
      console.error('[notifyFeedbackAttributed] projectSlug vacío — notificación cancelada')
      return
    }

    const adminClient = createAdminClient()

    // Resolver communitySlug desde communityId
    const { data: community } = await adminClient
      .from('communities')
      .select('slug')
      .eq('id', params.communityId)
      .single()
    const communitySlug = community?.slug ?? ''

    const { error } = await adminClient.from('notifications').insert({
      user_id: params.reviewerId,
      type: 'feedback_attributed',
      payload: {
        projectId: params.projectId,
        projectSlug: params.projectSlug,
        projectTitle: params.projectTitle,
        versionNumber: params.versionNumber,
        communitySlug,
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
